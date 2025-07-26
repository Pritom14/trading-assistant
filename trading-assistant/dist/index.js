"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const alertReceiver_1 = __importDefault(require("./api/alertReceiver"));
const getTradeSetups_1 = __importDefault(require("./api/getTradeSetups"));
const tradeInteractions_1 = __importDefault(require("./api/tradeInteractions"));
const expireTrades_1 = require("./jobs/expireTrades");
const http_1 = __importDefault(require("http"));
const websocketServer_1 = require("./realtime/websocketServer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/tv-alert', alertReceiver_1.default);
app.use('/api/trade-setups', getTradeSetups_1.default);
app.use('/api/trade-interactions', tradeInteractions_1.default);
// Placeholder: WebSocket server can be initialized here for real-time updates
// Run the expireOldTrades job every minute
setInterval(expireTrades_1.expireOldTrades, 60 * 1000);
const server = http_1.default.createServer(app);
(0, websocketServer_1.startWebSocketServer)(server);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Trading Assistant backend running on port ${PORT}`);
});
