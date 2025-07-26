"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const alertReceiver_1 = __importDefault(require("./alertReceiver"));
const prismaTradeStore_1 = require("../storage/prismaTradeStore");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/tv-alert', alertReceiver_1.default);
describe('POST /api/tv-alert', () => {
    const prisma = new client_1.PrismaClient();
    let userId;
    beforeAll(async () => {
        await prisma.trade.deleteMany();
        await prisma.user.deleteMany();
        const user = await prismaTradeStore_1.prismaTradeStore.getOrCreateDemoUser();
        userId = user.id;
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    it('accepts valid alert and processes it', async () => {
        const payload = {
            symbol: 'BTCUSD',
            side: 'long',
            entry: 30000,
            stop: 29500,
            target: 31000,
            type: 'breakout',
        };
        const res = await (0, supertest_1.default)(app).post('/api/tv-alert').send(payload);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        const trades = await prismaTradeStore_1.prismaTradeStore.getTrades(userId);
        expect(trades.length).toBeGreaterThan(0);
    });
    it('rejects missing fields', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/tv-alert').send({ symbol: 'BTCUSD' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
