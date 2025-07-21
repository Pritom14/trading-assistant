import { Server } from 'ws';
import http from 'http';

let wss: Server | null = null;

export function startWebSocketServer(server: http.Server) {
  wss = new Server({ server });
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Trading Assistant WebSocket.' }));
  });
}

export function notifyUser(trade: any) {
  if (!wss) return;
  const payload = JSON.stringify({ type: 'new-trade', trade });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
} 