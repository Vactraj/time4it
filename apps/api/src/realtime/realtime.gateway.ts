import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';


@WebSocketGateway({
    cors: { origin: true, credentials: true },
    namespace: '/ws',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;


    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
        try {
            // Token może być w cookie lub w query/header
            const cookieTokenName = 'token';
            const cookieHeader = client.handshake.headers.cookie || '';
            const cookies = Object.fromEntries(cookieHeader.split(';').filter(Boolean).map((c) => c.trim().split('=')));
            const token = (cookies[cookieTokenName] as string) || (client.handshake.auth?.token as string) || '';
            if (!token) throw new Error('No token');
            const payload = jwt.verify(token, 'dev-secret') as any;
            const tenantId = payload?.tenantId;
            if (!tenantId) throw new Error('No tenant');

            // Dołącz do pokoju tenantowego
            client.join(`tenant:${tenantId}`);
            client.data.tenantId = tenantId;
        } catch (e) {
            client.disconnect(true);
        }
    }


    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }


    emitOrderUpdated(tenantId: string, data: { orderId: string; status: string }) {
        console.log('Emitting order.updated to tenant:', tenantId, data);
        this.server.to(`tenant:${tenantId}`).emit('order.updated', { type: 'order.updated', payload: data });
    }
}