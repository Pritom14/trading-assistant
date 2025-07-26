import { tradeService, TradeCapturePayload } from './tradeService';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

describe('TradeService', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Clean up and create test user
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('saveTrade', () => {
    it('should save a valid BUY trade', async () => {
      const payload: TradeCapturePayload = {
        userId: testUserId,
        symbol: 'BANKNIFTY',
        entryPrice: 44500,
        quantity: 50,
        direction: 'BUY',
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(true);
      expect(result.trade).toBeDefined();
      expect(result.trade?.symbol).toBe('BANKNIFTY');
      expect(result.trade?.direction).toBe('BUY');
      expect(result.trade?.status).toBe('OPEN');
      expect(result.trade?.pnl).toBeNull(); // Should be null for open trades
    });

    it('should save a valid SELL trade with PnL calculation', async () => {
      const payload: TradeCapturePayload = {
        userId: testUserId,
        symbol: 'NIFTY',
        entryPrice: 19500,
        exitPrice: 19700,
        quantity: 100,
        direction: 'SELL',
        status: 'CLOSED',
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(true);
      expect(result.trade).toBeDefined();
      expect(result.trade?.symbol).toBe('NIFTY');
      expect(result.trade?.direction).toBe('SELL');
      expect(result.trade?.status).toBe('CLOSED');
      expect(result.trade?.pnl).toBe(-20000); // (19500 - 19700) * 100 * -1
    });

    it('should reject trade with invalid userId', async () => {
      const payload: TradeCapturePayload = {
        userId: 'invalid-user-id',
        symbol: 'BANKNIFTY',
        entryPrice: 44500,
        quantity: 50,
        direction: 'BUY',
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should reject trade with missing required fields', async () => {
      const payload = {
        userId: testUserId,
        symbol: 'BANKNIFTY',
        // Missing entryPrice, quantity, direction, status, timestamp, broker
      } as TradeCapturePayload;

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('entryPrice must be a positive number');
    });

    it('should reject trade with invalid direction', async () => {
      const payload: TradeCapturePayload = {
        userId: testUserId,
        symbol: 'BANKNIFTY',
        entryPrice: 44500,
        quantity: 50,
        direction: 'INVALID' as any,
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('direction must be BUY or SELL');
    });

    it('should reject trade with invalid status', async () => {
      const payload: TradeCapturePayload = {
        userId: testUserId,
        symbol: 'BANKNIFTY',
        entryPrice: 44500,
        quantity: 50,
        direction: 'BUY',
        status: 'INVALID' as any,
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('status must be OPEN, CLOSED, or REJECTED');
    });

    it('should reject trade with negative entry price', async () => {
      const payload: TradeCapturePayload = {
        userId: testUserId,
        symbol: 'BANKNIFTY',
        entryPrice: -100,
        quantity: 50,
        direction: 'BUY',
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        broker: 'ZERODHA'
      };

      const result = await tradeService.saveTrade(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('entryPrice must be a positive number');
    });
  });

  describe('getUserTrades', () => {
    beforeEach(async () => {
      await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
      // Ensure user still exists
      const existingUser = await prisma.user.findUnique({ where: { id: testUserId } });
      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User'
          }
        });
        testUserId = user.id;
      }
    });

    it('should return user trades in descending order', async () => {
      // Create multiple trades
      const trades = [
        {
          userId: testUserId,
          symbol: 'BANKNIFTY',
          entryPrice: 44500,
          quantity: 50,
          direction: 'BUY' as const,
          status: 'OPEN' as const,
          timestamp: new Date('2024-01-01'),
          broker: 'ZERODHA'
        },
        {
          userId: testUserId,
          symbol: 'NIFTY',
          entryPrice: 19500,
          quantity: 100,
          direction: 'SELL' as const,
          status: 'CLOSED' as const,
          timestamp: new Date('2024-01-02'),
          broker: 'ZERODHA'
        }
      ];

      await prisma.userTrade.createMany({ data: trades });

      const result = await tradeService.getUserTrades(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].timestamp.getTime()).toBeGreaterThan(result[1].timestamp.getTime()); // Descending order
    });

    it('should respect limit parameter', async () => {
      // Create 5 trades
      const trades = Array.from({ length: 5 }, (_, i) => ({
        userId: testUserId,
        symbol: 'BANKNIFTY',
        entryPrice: 44500 + i,
        quantity: 50,
        direction: 'BUY' as const,
        status: 'OPEN' as const,
        timestamp: new Date(`2024-01-${i + 1}`),
        broker: 'ZERODHA'
      }));

      await prisma.userTrade.createMany({ data: trades });

      const result = await tradeService.getUserTrades(testUserId, 3);

      expect(result).toHaveLength(3);
    });
  });

  describe('getUserTradeStats', () => {
    beforeEach(async () => {
      await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
      // Ensure user still exists
      const existingUser = await prisma.user.findUnique({ where: { id: testUserId } });
      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User'
          }
        });
        testUserId = user.id;
      }
    });

    it('should calculate correct statistics for winning and losing trades', async () => {
      // Create winning and losing trades
      const trades = [
        {
          userId: testUserId,
          symbol: 'BANKNIFTY',
          entryPrice: 44500,
          exitPrice: 44700,
          quantity: 50,
          direction: 'BUY' as const,
          status: 'CLOSED' as const,
          timestamp: new Date('2024-01-01'),
          broker: 'ZERODHA',
          pnl: 10000 // (44700 - 44500) * 50
        },
        {
          userId: testUserId,
          symbol: 'NIFTY',
          entryPrice: 19500,
          exitPrice: 19400,
          quantity: 100,
          direction: 'BUY' as const,
          status: 'CLOSED' as const,
          timestamp: new Date('2024-01-02'),
          broker: 'ZERODHA',
          pnl: -10000 // (19400 - 19500) * 100
        },
        {
          userId: testUserId,
          symbol: 'RELIANCE',
          entryPrice: 2500,
          exitPrice: 2600,
          quantity: 200,
          direction: 'SELL' as const,
          status: 'CLOSED' as const,
          timestamp: new Date('2024-01-03'),
          broker: 'ZERODHA',
          pnl: -20000 // (2500 - 2600) * 200 * -1
        }
      ];

      await prisma.userTrade.createMany({ data: trades });

      const stats = await tradeService.getUserTradeStats(testUserId);

      expect(stats.totalTrades).toBe(3);
      expect(stats.winningTrades).toBe(1);
      expect(stats.losingTrades).toBe(2);
      expect(stats.winRate).toBeCloseTo(33.33, 1);
      expect(stats.totalPnL).toBe(-20000);
      expect(stats.averagePnL).toBeCloseTo(-6666.67, 1);
    });

    it('should handle user with no closed trades', async () => {
      const stats = await tradeService.getUserTradeStats(testUserId);

      expect(stats.totalTrades).toBe(0);
      expect(stats.winningTrades).toBe(0);
      expect(stats.losingTrades).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.totalPnL).toBe(0);
      expect(stats.averagePnL).toBe(0);
    });
  });
}); 