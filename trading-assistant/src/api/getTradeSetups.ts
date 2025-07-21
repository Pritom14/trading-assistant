import { Router, Request, Response } from 'express';
import { prismaTradeStore } from '../storage';

const router = Router();

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

export default router; 