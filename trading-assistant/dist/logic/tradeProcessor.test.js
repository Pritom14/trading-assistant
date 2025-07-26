"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tradeProcessor_1 = require("./tradeProcessor");
const prismaTradeStore_1 = require("../storage/prismaTradeStore");
const client_1 = require("@prisma/client");
describe('processTradeAlert', () => {
    const prisma = new client_1.PrismaClient();
    let userId;
    beforeAll(async () => {
        // Clean up DB and create demo user
        await prisma.trade.deleteMany();
        await prisma.user.deleteMany();
        const user = await prismaTradeStore_1.prismaTradeStore.getOrCreateDemoUser();
        userId = user.id;
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    const baseAlert = {
        symbol: 'BTCUSD',
        side: 'long',
        entry: 30000,
        stop: 29500,
        target: 31000,
        type: 'breakout',
    };
    it('computes correct R:R, trailingStop, and confidence', async () => {
        const processed = (0, tradeProcessor_1.processTradeAlert)(baseAlert);
        await prismaTradeStore_1.prismaTradeStore.saveTrade(userId, processed);
        const trades = await prismaTradeStore_1.prismaTradeStore.getTrades(userId);
        expect(trades[0].rr).toBeCloseTo((31000 - 30000) / (30000 - 29500));
        expect(trades[0].trailingStop).toBe(30000 + 0.5 * (31000 - 30000));
        expect(trades[0].confidence).toBeGreaterThan(0);
        expect(trades[0].createdAt).toBeDefined();
    });
    it('handles short side correctly', async () => {
        const alert = { ...baseAlert, side: 'short', entry: 31000, stop: 31500, target: 30000, type: 'breakout' };
        const processed = (0, tradeProcessor_1.processTradeAlert)(alert);
        await prismaTradeStore_1.prismaTradeStore.saveTrade(userId, processed);
        const trades = await prismaTradeStore_1.prismaTradeStore.getTrades(userId);
        expect(trades[0].rr).toBeCloseTo((31000 - 30000) / Math.abs(31000 - 31500));
        expect(trades[0].trailingStop).toBe(31000 + 0.5 * (30000 - 31000));
    });
});
