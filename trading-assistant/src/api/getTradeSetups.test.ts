import request from 'supertest';
import express from 'express';
import getTradeSetups from './getTradeSetups';
import { prismaTradeStore } from '../storage/prismaTradeStore';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use('/api/trade-setups', getTradeSetups);

describe('GET /api/trade-setups', () => {
  const prisma = new PrismaClient();
  let userId: string;

  beforeAll(async () => {
    await prisma.userTrade.deleteMany();
    await prisma.tradeInteraction.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    const user = await prismaTradeStore.getOrCreateDemoUser();
    userId = user.id;
    // Add a trade for the user
    await prismaTradeStore.saveTrade(userId, {
      symbol: 'BTCUSD',
      side: 'long',
      entry: 30000,
      stop: 29500,
      target: 31000,
      type: 'breakout',
      rr: 2,
      trailingStop: 30500,
      confidence: 80,
      createdAt: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns trades for demo user', async () => {
    const res = await request(app).get('/api/trade-setups');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(res.body.trades.length).toBeGreaterThan(0);
  });
}); 