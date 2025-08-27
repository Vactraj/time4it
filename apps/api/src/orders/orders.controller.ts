import {Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query} from '@nestjs/common';
import {CreateOrderDto} from './dto/create-order.dto';
import {OrdersService} from './orders.service';
import {ListOrdersDto} from './dto/list-orders.dto';


@Controller('orders')
export class OrdersController {
    constructor(private readonly orders: OrdersService) {}


    @Post()
    async create(@Body() dto: CreateOrderDto) {
    // Walidacja typu pliku (na podstawie metadanych)
        if (dto.attachment) {
            const allowed = ('application/pdf,image/png,image/jpeg').split(',');
            if (!allowed.includes(dto.attachment.contentType)) {
                throw new HttpException(`Unsupported contentType: ${dto.attachment.contentType}`, HttpStatus.BAD_REQUEST);
            }
        }
        return await this.orders.createIdempotent(dto); // { orderId }
    }


    @Get()
    @HttpCode(200)
    async list(@Query() q: ListOrdersDto) {
        const { items, total, page, limit } = await this.orders.list(q);
        return { items, page, limit, total };
    }
}