import express from 'express';
import alertReceiver from './api/alertReceiver';
import getTradeSetups from './api/getTradeSetups';
import tradeInteractions from './api/tradeInteractions';
import { expireOldTrades } from './jobs/expireTrades';
import http from 'http';
import { startWebSocketServer } from './realtime/websocketServer';

const app = express();
app.use(express.json());

app.use('/api/tv-alert', alertReceiver);
app.use('/api/trade-setups', getTradeSetups);
app.use('/api/trade-interactions', tradeInteractions);

// Placeholder: WebSocket server can be initialized here for real-time updates

// Run the expireOldTrades job every minute
setInterval(expireOldTrades, 60 * 1000);

const server = http.createServer(app);
startWebSocketServer(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Trading Assistant backend running on port ${PORT}`);
}); 