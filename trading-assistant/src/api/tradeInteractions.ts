import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/trade-interactions
router.post('/', async (req: Request, res: Response) => {
  const { userId, tradeId, action } = req.body;
  if (!userId || !tradeId || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const interaction = await prisma.tradeInteraction.create({
      data: { userId, tradeId, action },
    });
    res.status(201).json({ success: true, interaction });
  } catch (e) {
    res.status(500).json({ error: 'Failed to log interaction', details: (e as Error).message });
  }
});

export default router; 