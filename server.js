const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const clients = new Map(); // userId -> ws

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            
            // 登录
            if (msg.type === 'login') {
                clients.set(msg.userId, ws);
                console.log(`User ${msg.userId} logged in`);
                return;
            }

            // 转发消息
            const targetWs = clients.get(msg.toUserId);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(data);
            }
        } catch (e) {
            console.error('Invalid JSON', e);
        }
    });

    ws.on('close', () => {
        for (let [userId, socket] of clients.entries()) {
            if (socket === ws) {
                clients.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

console.log('iChat WebSocket Server running on port', process.env.PORT || 8080);
