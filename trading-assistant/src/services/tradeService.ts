import { PrismaClient, UserTrade, TradeDirection, TradeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface TradeCapturePayload {
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  direction: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED' | 'REJECTED';
  timestamp: string;
  broker: string;
  rawPayload?: any;
}

export interface TradeCaptureResponse {
  success: boolean;
  trade?: UserTrade;
  error?: string;
}

export class TradeService {
  /**
   * Validates the trade capture payload
   */
  private validatePayload(payload: TradeCapturePayload): string | null {
    if (!payload.userId) return 'userId is required';
    if (!payload.symbol) return 'symbol is required';
    if (!payload.entryPrice || payload.entryPrice <= 0) return 'entryPrice must be a positive number';
    if (payload.exitPrice !== undefined && payload.exitPrice <= 0) return 'exitPrice must be a positive number';
    if (!payload.quantity || payload.quantity <= 0) return 'quantity must be a positive number';
    if (!['BUY', 'SELL'].includes(payload.direction)) return 'direction must be BUY or SELL';
    if (!['OPEN', 'CLOSED', 'REJECTED'].includes(payload.status)) return 'status must be OPEN, CLOSED, or REJECTED';
    if (!payload.timestamp) return 'timestamp is required';
    if (!payload.broker) return 'broker is required';
    
    return null;
  }

  /**
   * Calculates PnL for closed trades
   */
  private calculatePnL(payload: TradeCapturePayload): number | null {
    if (payload.status !== 'CLOSED' || !payload.exitPrice) {
      return null;
    }

    const priceDiff = payload.exitPrice - payload.entryPrice;
    const multiplier = payload.direction === 'BUY' ? 1 : -1;
    return priceDiff * multiplier * payload.quantity;
  }

  /**
   * Saves a trade to the database
   */
  async saveTrade(payload: TradeCapturePayload): Promise<TradeCaptureResponse> {
    try {
      // Validate payload
      const validationError = this.validatePayload(payload);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Calculate PnL if trade is closed
      const pnl = this.calculatePnL(payload);

      // Save trade to database
      const trade = await prisma.userTrade.create({
        data: {
          userId: payload.userId,
          symbol: payload.symbol,
          entryPrice: payload.entryPrice,
          exitPrice: payload.exitPrice,
          quantity: payload.quantity,
          direction: payload.direction as TradeDirection,
          status: payload.status as TradeStatus,
          pnl,
          timestamp: new Date(payload.timestamp),
          broker: payload.broker,
          rawPayload: payload.rawPayload
        }
      });

      return {
        success: true,
        trade
      };

    } catch (error) {
      console.error('Error saving trade:', error);
      return {
        success: false,
        error: 'Failed to save trade'
      };
    }
  }

  /**
   * Get all trades for a user
   */
  async getUserTrades(userId: string, limit: number = 50): Promise<UserTrade[]> {
    return await prisma.userTrade.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  /**
   * Get trade statistics for a user
   */
  async getUserTradeStats(userId: string) {
    const trades = await prisma.userTrade.findMany({
      where: { 
        userId,
        status: 'CLOSED'
      }
    });

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    return {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalPnL,
      averagePnL: totalTrades > 0 ? totalPnL / totalTrades : 0
    };
  }
}

export const tradeService = new TradeService(); 