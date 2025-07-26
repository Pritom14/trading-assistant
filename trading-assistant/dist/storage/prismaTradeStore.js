"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaTradeStore = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PrismaTradeStore {
    async getOrCreateDemoUser() {
        let user = await prisma.user.findUnique({ where: { email: 'demo@user.com' } });
        if (!user) {
            user = await prisma.user.create({ data: { email: 'demo@user.com', name: 'Demo User' } });
        }
        return user;
    }
    async saveTrade(userId, trade) {
        await prisma.trade.create({
            data: {
                userId,
                symbol: trade.symbol,
                side: trade.side,
                type: trade.type,
                entry: trade.entry,
                stop: trade.stop,
                target: trade.target,
                confidence: trade.confidence,
                rr: trade.rr,
                trailingStop: trade.trailingStop,
                origin: trade.origin,
                createdAt: trade.createdAt ? new Date(trade.createdAt) : undefined,
                validUntil: trade.validUntil ? new Date(trade.validUntil) : undefined,
                confidenceFactors: trade.confidenceFactors,
                status: trade.status,
                delivered: trade.delivered,
            },
        });
    }
    async getTrades(userId, filter = {}) {
        const where = { userId };
        if (filter.origin)
            where.origin = filter.origin;
        if (filter.status)
            where.status = filter.status;
        if (filter.delivered !== undefined)
            where.delivered = filter.delivered;
        if (filter.validUntil)
            where.validUntil = { gte: new Date(filter.validUntil) };
        const trades = await prisma.trade.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return trades.map((t) => ({
            id: t.id,
            userId: t.userId,
            symbol: t.symbol,
            side: t.side,
            entry: t.entry,
            stop: t.stop,
            target: t.target,
            type: t.type,
            confidence: t.confidence,
            rr: t.rr,
            trailingStop: t.trailingStop ?? undefined,
            origin: t.origin ?? undefined,
            createdAt: t.createdAt?.toISOString(),
            validUntil: t.validUntil?.toISOString(),
            confidenceFactors: typeof t.confidenceFactors === 'object' && t.confidenceFactors !== null ? t.confidenceFactors : undefined,
            status: t.status ?? undefined,
            delivered: t.delivered ?? undefined,
        }));
    }
}
exports.prismaTradeStore = new PrismaTradeStore();
