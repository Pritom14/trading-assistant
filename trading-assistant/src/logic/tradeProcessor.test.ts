import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
import { processTradeAlert } from './tradeProcessor';
import { TradeAlert } from '../models/TradeAlert';
import { prismaTradeStore } from '../storage/prismaTradeStore';
import { PrismaClient } from '@prisma/client';

describe('processTradeAlert', () => {
  const prisma = new PrismaClient();
  let userId: string;

  beforeAll(async () => {
    // Clean up DB and create demo user
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    const user = await prismaTradeStore.getOrCreateDemoUser();
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const baseAlert: TradeAlert = {
    symbol: 'BTCUSD',
    side: 'long',
    entry: 30000,
    stop: 29500,
    target: 31000,
    type: 'breakout',
  };

  it('computes correct R:R, trailingStop, and confidence', async () => {
    const processed = processTradeAlert(baseAlert);
    await prismaTradeStore.saveTrade(userId, processed);
    const trades = await prismaTradeStore.getTrades(userId);
    expect(trades[0].rr).toBeCloseTo((31000 - 30000) / (30000 - 29500));
    expect(trades[0].trailingStop).toBe(30000 + 0.5 * (31000 - 30000));
    expect(trades[0].confidence).toBeGreaterThan(0);
    expect(trades[0].createdAt).toBeDefined();
  });

  it('handles short side correctly', async () => {
    const alert = { ...baseAlert, side: 'short' as 'short', entry: 31000, stop: 31500, target: 30000, type: 'breakout' };
    const processed = processTradeAlert(alert);
    await prismaTradeStore.saveTrade(userId, processed);
    const trades = await prismaTradeStore.getTrades(userId);
    expect(trades[0].rr).toBeCloseTo((31000 - 30000) / Math.abs(31000 - 31500));
    expect(trades[0].trailingStop).toBe(31000 + 0.5 * (30000 - 31000));
  });
}); 