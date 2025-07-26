"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/trade-interactions
router.post('/', async (req, res) => {
    const { userId, tradeId, action } = req.body;
    if (!userId || !tradeId || !action) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const interaction = await prisma.tradeInteraction.create({
            data: { userId, tradeId, action },
        });
        res.status(201).json({ success: true, interaction });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to log interaction', details: e.message });
    }
});
// GET /api/trade-interactions?userId=demo
router.get('/', async (req, res) => {
    const { userId } = req.query;
    if (!userId)
        return res.status(400).json({ error: 'Missing userId' });
    const interactions = await prisma.tradeInteraction.findMany({
        where: { userId: String(userId) },
        orderBy: { timestamp: 'desc' },
        take: 20,
    });
    res.json({ interactions });
});
exports.default = router;
