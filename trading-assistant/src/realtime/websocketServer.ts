import { Server, WebSocket } from 'ws';
import http from 'http';

let wss: Server | null = null;
// Map userId to Set of WebSocket connections
const userSockets: Map<string, Set<WebSocket>> = new Map();

export function startWebSocketServer(server: http.Server) {
  wss = new Server({ server });
  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Trading Assistant WebSocket.' }));
    let userId: string | null = null;

    ws.on('message', (msg: any) => {
      try {
        const data = JSON.parse(msg.toString());
        if (typeof data.userId === 'string') {
          userId = data.userId;
          if (typeof userId === 'string') {
            if (!userSockets.has(userId)) userSockets.set(userId, new Set());
            userSockets.get(userId)!.add(ws);
          }
        }
      } catch (e) {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      if (typeof userId === 'string' && userSockets.has(userId)) {
        userSockets.get(userId)!.delete(ws);
        if (userSockets.get(userId)!.size === 0) userSockets.delete(userId);
      }
    });
  });
}

// Optionally target a specific userId, else broadcast
export function notifyUser(trade: any, userId?: string) {
  if (!wss) return;
  const payload = JSON.stringify({ type: 'new-trade', trade });
  if (userId && userSockets.has(userId)) {
    userSockets.get(userId)!.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  } else {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
} 