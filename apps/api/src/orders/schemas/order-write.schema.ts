import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderWriteDocument = HydratedDocument<OrderWrite>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class OrderWrite {
    @Prop({ required: true })
    orderId!: string; // ord_xxx (public id)

    @Prop({ required: true, index: true })
    tenantId!: string;

    @Prop({ required: true })
    requestId!: string; // idempotency key (per tenant)

    @Prop({ type: Object, required: true })
    buyer!: { email: string; name?: string };

    @Prop({ type: [{ sku: String, qty: Number, price: Number }], required: true })
    items!: { sku: string; qty: number; price: number }[];

    @Prop({ type: Object })
    attachment?: { filename: string; contentType: string; size: number; storageKey: string };

    @Prop({ required: true })
    total!: number;

    @Prop({ required: true, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' })
    status!: 'PENDING' | 'PAID' | 'CANCELLED';

    @Prop()
    createdAt!: Date;
}

export const OrderWriteSchema = SchemaFactory.createForClass(OrderWrite);

OrderWriteSchema.index({ tenantId: 1, requestId: 1 }, { unique: true });