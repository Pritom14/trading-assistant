import { Router, Request, Response } from 'express';
import { prismaTradeStore } from '../storage';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  // For demo, always use demo user
  const user = await prismaTradeStore.getOrCreateDemoUser();
  const userId = user.id;
  const { origin, status, delivered, validUntil } = req.query;
  const filter: any = {};
  if (origin) filter.origin = origin;
  if (status) filter.status = status;
  if (delivered !== undefined) filter.delivered = delivered === 'true';
  if (validUntil) filter.validUntil = validUntil;
  const trades = await prismaTradeStore.getTrades(userId, filter);
  res.json({ userId, trades });
});

// PATCH /api/trade-setups/:id to mark as delivered
router.patch('/:id', async (req: Request, res: Response) => {
  const tradeId = req.params.id;
  try {
    const updated = await prisma.trade.update({
      where: { id: tradeId },
      data: { delivered: true },
    });
    res.json({ success: true, trade: updated });
  } catch (e) {
    res.status(404).json({ error: 'Trade not found', details: (e as Error).message });
  }
});

export default router; 