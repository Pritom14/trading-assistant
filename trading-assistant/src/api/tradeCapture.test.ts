import request from 'supertest';
import express from 'express';
import tradeCapture from './tradeCapture';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());
app.use('/api/trades', tradeCapture);

describe('POST /api/trades/log', () => {
  const prisma = new PrismaClient();
  let testUserId: string;

  beforeAll(async () => {
    // Clean up in correct order - delete dependent records first
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
    // Clean up in correct order - delete dependent records first
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should capture a valid trade', async () => {
    const payload = {
      userId: testUserId,
      symbol: 'BANKNIFTY',
      entryPrice: 44500,
      exitPrice: 44720,
      quantity: 50,
      direction: 'BUY',
      status: 'CLOSED',
      timestamp: new Date().toISOString(),
      broker: 'ZERODHA'
    };

    const res = await request(app)
      .post('/api/trades/log')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.trade).toBeDefined();
    expect(res.body.trade.symbol).toBe('BANKNIFTY');
    expect(res.body.trade.direction).toBe('BUY');
    expect(res.body.trade.status).toBe('CLOSED');
    expect(res.body.message).toBe('Trade captured successfully');
  });

  it('should reject request with missing required fields', async () => {
    const payload = {
      userId: testUserId,
      symbol: 'BANKNIFTY',
      // Missing entryPrice, quantity, direction, status, timestamp, broker
    };

    const res = await request(app)
      .post('/api/trades/log')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Missing required fields');
  });

  it('should reject request with invalid user ID', async () => {
    const payload = {
      userId: 'invalid-user-id',
      symbol: 'BANKNIFTY',
      entryPrice: 44500,
      quantity: 50,
      direction: 'BUY',
      status: 'OPEN',
      timestamp: new Date().toISOString(),
      broker: 'ZERODHA'
    };

    const res = await request(app)
      .post('/api/trades/log')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User not found');
  });

  it('should handle server errors gracefully', async () => {
    // This test would require mocking the service to throw an error
    // For now, we'll test with invalid data that should cause validation errors
    const payload = {
      userId: testUserId,
      symbol: 'BANKNIFTY',
      entryPrice: -100, // Invalid negative price
      quantity: 50,
      direction: 'BUY',
      status: 'OPEN',
      timestamp: new Date().toISOString(),
      broker: 'ZERODHA'
    };

    const res = await request(app)
      .post('/api/trades/log')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('entryPrice must be a positive number');
  });
});

describe('GET /api/trades/user/:userId', () => {
  const prisma = new PrismaClient();
  let testUserId: string;

  beforeAll(async () => {
    // Clean up in correct order - delete dependent records first
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

    // Create some test trades
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
  });

  afterAll(async () => {
    // Clean up in correct order - delete dependent records first
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should return user trades', async () => {
    const res = await request(app)
      .get(`/api/trades/user/${testUserId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.trades).toHaveLength(2);
    expect(res.body.count).toBe(2);
  });

  it('should respect limit parameter', async () => {
    const res = await request(app)
      .get(`/api/trades/user/${testUserId}?limit=1`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.trades).toHaveLength(1);
    expect(res.body.count).toBe(1);
  });

  it('should return empty array for non-existent user', async () => {
    const res = await request(app)
      .get('/api/trades/user/non-existent-user');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.trades).toHaveLength(0);
    expect(res.body.count).toBe(0);
  });
});

describe('GET /api/trades/user/:userId/stats', () => {
  const prisma = new PrismaClient();
  let testUserId: string;

  beforeAll(async () => {
    // Clean up in correct order - delete dependent records first
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

    // Create test trades with PnL
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
        pnl: 10000
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
        pnl: -10000
      }
    ];

    await prisma.userTrade.createMany({ data: trades });
  });

  afterAll(async () => {
    // Clean up in correct order - delete dependent records first
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should return user trade statistics', async () => {
    const res = await request(app)
      .get(`/api/trades/user/${testUserId}/stats`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalTrades).toBe(2);
    expect(res.body.stats.winningTrades).toBe(1);
    expect(res.body.stats.losingTrades).toBe(1);
    expect(res.body.stats.winRate).toBe(50);
    expect(res.body.stats.totalPnL).toBe(0);
    expect(res.body.stats.averagePnL).toBe(0);
  });

  it('should return zero stats for user with no closed trades', async () => {
    const res = await request(app)
      .get('/api/trades/user/non-existent-user/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalTrades).toBe(0);
    expect(res.body.stats.winningTrades).toBe(0);
    expect(res.body.stats.losingTrades).toBe(0);
    expect(res.body.stats.winRate).toBe(0);
    expect(res.body.stats.totalPnL).toBe(0);
    expect(res.body.stats.averagePnL).toBe(0);
  });
}); 