"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const getTradeSetups_1 = __importDefault(require("./getTradeSetups"));
const prismaTradeStore_1 = require("../storage/prismaTradeStore");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use('/api/trade-setups', getTradeSetups_1.default);
describe('GET /api/trade-setups', () => {
    const prisma = new client_1.PrismaClient();
    let userId;
    beforeAll(async () => {
        await prisma.trade.deleteMany();
        await prisma.user.deleteMany();
        const user = await prismaTradeStore_1.prismaTradeStore.getOrCreateDemoUser();
        userId = user.id;
        // Add a trade for the user
        await prismaTradeStore_1.prismaTradeStore.saveTrade(userId, {
            symbol: 'BTCUSD',
            side: 'long',
            entry: 30000,
            stop: 29500,
            target: 31000,
            type: 'breakout',
            rr: 2,
            trailingStop: 30500,
            confidence: 80,
            createdAt: new Date().toISOString(),
        });
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    it('returns trades for demo user', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/trade-setups');
        expect(res.status).toBe(200);
        expect(res.body.userId).toBe(userId);
        expect(res.body.trades.length).toBeGreaterThan(0);
    });
});
