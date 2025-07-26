import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function testTradeCapture() {
  try {
    // Get or create a test user
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
      console.log('Created new user:', user.id);
    } else {
      console.log('Using existing user:', user.id);
    }

    // Test trade capture API
    const tradePayload = {
      userId: user.id,
      symbol: 'BANKNIFTY',
      entryPrice: 44500,
      exitPrice: 44720,
      quantity: 50,
      direction: 'BUY' as const,
      status: 'CLOSED' as const,
      timestamp: new Date().toISOString(),
      broker: 'ZERODHA'
    };

    console.log('Testing trade capture with payload:', tradePayload);

    const response = await fetch('http://localhost:4000/api/trades/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradePayload)
    });

    const result = await response.json();
    console.log('Trade capture result:', result);

    if (result.success) {
      // Test getting user trades
      const tradesResponse = await fetch(`http://localhost:4000/api/trades/user/${user.id}`);
      const tradesResult = await tradesResponse.json();
      console.log('User trades:', tradesResult);

      // Test getting user stats
      const statsResponse = await fetch(`http://localhost:4000/api/trades/user/${user.id}/stats`);
      const statsResult = await statsResponse.json();
      console.log('User stats:', statsResult);
    }

  } catch (error) {
    console.error('Error testing trade capture:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTradeCapture(); 