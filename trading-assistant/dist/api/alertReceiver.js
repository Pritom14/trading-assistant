"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tradeProcessor_1 = require("../logic/tradeProcessor");
const storage_1 = require("../storage");
const websocketServer_1 = require("../realtime/websocketServer");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * Sample curl payload:
 * curl -X POST http://localhost:4000/api/tv-alert \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "symbol": "BTCUSD",
 *     "side": "long",
 *     "entry": 30000,
 *     "stop": 29500,
 *     "target": 31000,
 *     "type": "breakout",
 *     "origin": "BreakoutStrategy",
 *     "validUntil": "2025-07-20T00:00:00Z"
 *   }'
 */
router.post('/', async (req, res) => {
    // For demo, always use demo user
    const user = await storage_1.prismaTradeStore.getOrCreateDemoUser();
    const userId = user.id;
    const alert = req.body;
    // Basic validation
    if (!alert.symbol || !alert.side || !alert.entry || !alert.stop || !alert.target || !alert.type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Pass through all fields for extensibility
        const processed = (0, tradeProcessor_1.processTradeAlert)({ ...alert });
        await storage_1.prismaTradeStore.saveTrade(userId, processed);
        // Fetch the saved trade with id
        const saved = await prisma.trade.findFirst({
            where: {
                userId,
                symbol: processed.symbol,
                entry: processed.entry,
                createdAt: new Date(processed.createdAt || Date.now()),
            },
            orderBy: { createdAt: 'desc' },
        });
        if (saved)
            (0, websocketServer_1.notifyUser)(saved);
        res.status(201).json({ success: true, processed });
    }
    catch (e) {
        res.status(500).json({ error: 'Processing failed', details: e.message });
    }
});
exports.default = router;
