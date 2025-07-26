"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketServer = startWebSocketServer;
exports.notifyUser = notifyUser;
const ws_1 = require("ws");
let wss = null;
// Map userId to Set of WebSocket connections
const userSockets = new Map();
function startWebSocketServer(server) {
    wss = new ws_1.Server({ server });
    wss.on('connection', (ws) => {
        ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Trading Assistant WebSocket.' }));
        let userId = null;
        ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if (typeof data.userId === 'string') {
                    userId = data.userId;
                    if (typeof userId === 'string') {
                        if (!userSockets.has(userId))
                            userSockets.set(userId, new Set());
                        userSockets.get(userId).add(ws);
                    }
                }
            }
            catch (e) {
                // Ignore malformed messages
            }
        });
        ws.on('close', () => {
            if (typeof userId === 'string' && userSockets.has(userId)) {
                userSockets.get(userId).delete(ws);
                if (userSockets.get(userId).size === 0)
                    userSockets.delete(userId);
            }
        });
    });
}
// Optionally target a specific userId, else broadcast
function notifyUser(trade, userId) {
    if (!wss)
        return;
    const payload = JSON.stringify({ type: 'new-trade', trade });
    if (userId && userSockets.has(userId)) {
        userSockets.get(userId).forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }
    else {
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }
}
