import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type OrderCreatedEvent = {
    type: 'orders.created.v1';
    tenantId: string;
    orderId: string;
    payload: any; // buyer, items, total, attachment, createdAt
};

export type OrderStatusChangedEvent = {
    type: 'orders.status.v1';
    tenantId: string;
    orderId: string;
    payload: { status: OrderStatus };
};

export type AppEvent = OrderCreatedEvent | OrderStatusChangedEvent;

@Injectable()
export class EventBus implements OnModuleDestroy {
    private subject = new Subject<AppEvent>();

    public publish(evt: AppEvent) {
        this.subject.next(evt);
    }

    public subscribe(handler: (evt: AppEvent) => void) {
        const sub = this.subject.subscribe(handler);
        return () => sub.unsubscribe();
    }

    onModuleDestroy() {
        this.subject.complete();
    }
}