"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../storage");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', async (req, res) => {
    // For demo, always use demo user
    const user = await storage_1.prismaTradeStore.getOrCreateDemoUser();
    const userId = user.id;
    const { origin, status, delivered, validUntil } = req.query;
    const filter = {};
    if (origin)
        filter.origin = origin;
    if (status)
        filter.status = status;
    if (delivered !== undefined)
        filter.delivered = delivered === 'true';
    if (validUntil)
        filter.validUntil = validUntil;
    const trades = await storage_1.prismaTradeStore.getTrades(userId, filter);
    res.json({ userId, trades });
});
// PATCH /api/trade-setups/:id to mark as delivered
router.patch('/:id', async (req, res) => {
    const tradeId = req.params.id;
    try {
        const updated = await prisma.trade.update({
            where: { id: tradeId },
            data: { delivered: true },
        });
        res.json({ success: true, trade: updated });
    }
    catch (e) {
        res.status(404).json({ error: 'Trade not found', details: e.message });
    }
});
// POST /api/trade-setups/mark-all-delivered (for demo/testing cleanup)
router.post('/mark-all-delivered', async (req, res) => {
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'Missing userId' });
    const result = await prisma.trade.updateMany({
        where: { userId, delivered: false },
        data: { delivered: true },
    });
    res.json({ success: true, updated: result.count });
});
exports.default = router;
