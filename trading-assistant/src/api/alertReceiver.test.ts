import request from 'supertest';
import express from 'express';
import alertReceiver from './alertReceiver';
import { prismaTradeStore } from '../storage/prismaTradeStore';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/tv-alert', alertReceiver);

describe('POST /api/tv-alert', () => {
  const prisma = new PrismaClient();
  let userId: string;

  beforeAll(async () => {
    await prisma.trade.deleteMany();
    await prisma.user.deleteMany();
    const user = await prismaTradeStore.getOrCreateDemoUser();
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('accepts valid alert and processes it', async () => {
    const payload = {
      symbol: 'BTCUSD',
      side: 'long',
      entry: 30000,
      stop: 29500,
      target: 31000,
      type: 'breakout',
    };
    const res = await request(app).post('/api/tv-alert').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const trades = await prismaTradeStore.getTrades(userId);
    expect(trades.length).toBeGreaterThan(0);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/tv-alert').send({ symbol: 'BTCUSD' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
}); 