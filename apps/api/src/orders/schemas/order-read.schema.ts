import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderReadDocument = HydratedDocument<OrderRead>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class OrderRead {
    @Prop({ required: true, index: true })
    orderId!: string;

    @Prop({ required: true, index: true })
    tenantId!: string;

    @Prop({ required: true, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING', index: true })
    status!: 'PENDING' | 'PAID' | 'CANCELLED';

    @Prop({ required: true })
    buyerEmail!: string;

    @Prop({ required: true })
    total!: number;

    @Prop({ type: Object })
    attachment?: { filename: string; storageKey: string };

    @Prop()
    createdAt!: Date;
}

export const OrderReadSchema = SchemaFactory.createForClass(OrderRead);

OrderReadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderReadSchema.index({ tenantId: 1, buyerEmail: 1 });
