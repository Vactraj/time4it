import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventBus, AppEvent } from '../events/events.service';
import { OrderRead, OrderReadDocument } from './schemas/order-read.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';


@Injectable()
export class ProjectionService implements OnModuleInit {
    private unsubscribe?: () => void;


    constructor(
        private bus: EventBus,
        @InjectModel(OrderRead.name) private readModel: Model<OrderReadDocument>,
        private ws: RealtimeGateway,
    ) {}


    onModuleInit() {
        this.unsubscribe = this.bus.subscribe((evt: AppEvent) => this.handle(evt));
    }


    private async handle(evt: AppEvent) {
        switch (evt.type) {
            case 'orders.created.v1': {
                const { tenantId, orderId, payload } = evt;
                const doc = {
                    orderId,
                    tenantId,
                    status: 'PENDING' as const,
                    buyerEmail: payload.buyer.email,
                    total: payload.total,
                    attachment: payload.attachment,
                    createdAt: payload.createdAt,
                };
                await this.readModel.create(doc);
                break;
            }
            case 'orders.status.v1': {
                const { tenantId, orderId, payload } = evt;
                await this.readModel.updateOne({ tenantId, orderId }, { $set: { status: payload.status } }).exec();

                // Dopiero po aktualizacji projekcji – wyślij na WS
                this.ws.emitOrderUpdated(tenantId, { orderId, status: payload.status });
                break;
            }
        }
    }
}