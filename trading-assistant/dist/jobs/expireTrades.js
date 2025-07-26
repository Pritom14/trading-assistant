"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireOldTrades = expireOldTrades;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function expireOldTrades() {
    const now = new Date();
    const result = await prisma.trade.updateMany({
        where: {
            validUntil: { lt: now },
            status: { not: 'expired' },
        },
        data: { status: 'expired' },
    });
    if (result.count > 0) {
        console.log(`[expireTrades] Marked ${result.count} trades as expired.`);
    }
}
