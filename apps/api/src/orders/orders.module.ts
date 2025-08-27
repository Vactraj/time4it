import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderWrite, OrderWriteSchema } from './schemas/order-write.schema';
import { OrderRead, OrderReadSchema } from './schemas/order-read.schema';
import { ProjectionService } from './projection.service';
import { RealtimeModule } from '../realtime/realtime.module';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OrderWrite.name, schema: OrderWriteSchema, collection: 'orders_write' },
            { name: OrderRead.name, schema: OrderReadSchema, collection: 'orders_read' },
        ]),
        RealtimeModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, ProjectionService],
})
export class OrdersModule {}