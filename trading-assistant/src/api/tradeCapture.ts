import { Router, Request, Response } from 'express';
import { tradeService, TradeCapturePayload } from '../services/tradeService';

const router = Router();

/**
 * POST /api/trades/log
 * Captures a user trade from broker platforms
 * 
 * Request body:
 * {
 *   userId: string,
 *   symbol: string,
 *   entryPrice: number,
 *   exitPrice?: number,
 *   quantity: number,
 *   direction: "BUY" | "SELL",
 *   status: "OPEN" | "CLOSED" | "REJECTED",
 *   timestamp: string,
 *   broker: string,
 *   rawPayload?: any
 * }
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const payload: TradeCapturePayload = req.body;

    // Validate required fields
    if (!payload.userId || !payload.symbol || !payload.entryPrice || 
        !payload.quantity || !payload.direction || !payload.status || 
        !payload.timestamp || !payload.broker) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Save trade using the service
    const result = await tradeService.saveTrade(payload);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      trade: result.trade,
      message: 'Trade captured successfully'
    });

  } catch (error) {
    console.error('Error in trade capture endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trades/user/:userId
 * Get all trades for a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const trades = await tradeService.getUserTrades(userId, limit);

    res.json({
      success: true,
      trades,
      count: trades.length
    });

  } catch (error) {
    console.error('Error fetching user trades:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trades/user/:userId/stats
 * Get trade statistics for a specific user
 */
router.get('/user/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await tradeService.getUserTradeStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching user trade stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 