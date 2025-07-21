import { Router, Request, Response } from 'express';
import { TradeAlert } from '../models/TradeAlert';
import { processTradeAlert } from '../logic/tradeProcessor';
import { prismaTradeStore } from '../storage';
import { notifyUser } from '../realtime/websocketServer';

const router = Router();

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

router.post('/', async (req: Request, res: Response) => {
  // For demo, always use demo user
  const user = await prismaTradeStore.getOrCreateDemoUser();
  const userId = user.id;
  const alert: TradeAlert = req.body;

  // Basic validation
  if (!alert.symbol || !alert.side || !alert.entry || !alert.stop || !alert.target || !alert.type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Pass through all fields for extensibility
    const processed = processTradeAlert({ ...alert });
    await prismaTradeStore.saveTrade(userId, processed);
    notifyUser(processed);
    res.status(201).json({ success: true, processed });
  } catch (e) {
    res.status(500).json({ error: 'Processing failed', details: (e as Error).message });
  }
});

export default router; 