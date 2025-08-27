const { io } = require('socket.io-client');

// token 24h (tenantId: t-123, secret: dev-secret)
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InQtMTIzIiwiaWF0IjoxNzU2MzIzOTUwLCJleHAiOjE3NTY0MDY5NTB9.9qGSR7golIpryuD0Yp0RNhAIAEwPQFifEwclDcajdXM';

const socket = io('http://localhost:3000/ws', {
    auth: { token: JWT },
});

socket.on('connect', () => console.log('✅ connected', socket.id));
socket.on('order.updated', (msg) => console.log('📦 update:', msg));
socket.on('disconnect', (reason) => console.log('❌ disconnected:', reason));
socket.on('connect_error', (err) => console.error('❗ connect_error:', err.message));