import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { OrderWrite, OrderWriteDocument } from './schemas/order-write.schema';
import { OrderRead, OrderReadDocument } from './schemas/order-read.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { EventBus } from '../events/events.service';


@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(OrderWrite.name) private writeModel: Model<OrderWriteDocument>,
        @InjectModel(OrderRead.name) private readModel: Model<OrderReadDocument>,
        private bus: EventBus,
    ) {}

    async createIdempotent(dto: CreateOrderDto): Promise<{ orderId: string }> {
        const total = dto.items.reduce((acc, it) => acc + it.qty * it.price, 0);
        const orderId = `ord_${nanoid(8)}`;


        try {
            const created = await this.writeModel.create({
                orderId,
                tenantId: dto.tenantId,
                requestId: dto.requestId,
                buyer: dto.buyer,
                items: dto.items,
                attachment: dto.attachment,
                total,
                status: 'PENDING',
            });


// Emit OrderCreated
            this.bus.publish({
                type: 'orders.created.v1',
                tenantId: dto.tenantId,
                orderId: created.orderId,
                payload: {
                    buyer: dto.buyer,
                    items: dto.items,
                    total,
                    attachment: dto.attachment ? { filename: dto.attachment.filename, storageKey: dto.attachment.storageKey } : undefined,
                    createdAt: created.createdAt,
                },
            });


            // Symulacja async zmiany statusu 10–15s (v1 uproszczenie zamiast brokera)
            const delay = 10000 + Math.floor(Math.random() * 5000);
            setTimeout(async () => {
                await this.changeStatus(created.tenantId, created.orderId, 'PAID');
            }, delay);


            return { orderId: created.orderId };
        } catch (e: any) {
            // Duplicate key error for unique (tenantId, requestId)
            if (e?.code === 11000) {
                const existing = await this.writeModel.findOne({ tenantId: dto.tenantId, requestId: dto.requestId }).lean();
                if (existing) return { orderId: existing.orderId };
            }
            throw e;
        }
    }

    async changeStatus(tenantId: string, orderId: string, status: 'PENDING' | 'PAID' | 'CANCELLED') {
        const updated = await this.writeModel.findOneAndUpdate({ tenantId, orderId }, { $set: { status } }, { new: true });
        if (updated) {
            this.bus.publish({ type: 'orders.status.v1', tenantId, orderId, payload: { status } });
        }
    }

    async list(q: ListOrdersDto): Promise<{ items: any[]; total: number; page: number; limit: number }> {
        const { tenantId, status, buyerEmail, from, to } = q;
        const page = q.page || 1;
        const limit = q.limit || 10;


        const filter: any = { tenantId };
        if (status) filter.status = status;
        if (buyerEmail) filter.buyerEmail = buyerEmail;
        if (from || to) {
            filter.createdAt = {} as any;
            if (from) (filter.createdAt as any).$gte = new Date(from);
            if (to) (filter.createdAt as any).$lte = new Date(to);
        }


        const [items, total] = await Promise.all([
            this.readModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.readModel.countDocuments(filter),
        ]);


        return { items, total, page, limit };
    }
}