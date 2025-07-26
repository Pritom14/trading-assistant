import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function simulateChromeExtension() {
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

    // Simulate different trade scenarios from Chrome extension
    const tradeScenarios = [
      {
        description: 'Zerodha Kite - BUY BANKNIFTY (Open Position)',
        payload: {
          userId: user.id,
          symbol: 'BANKNIFTY',
          entryPrice: 44500,
          quantity: 50,
          direction: 'BUY',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
          broker: 'ZERODHA',
          rawPayload: {
            source: 'kite.zerodha.com',
            orderType: 'MARKET',
            productType: 'MIS'
          }
        }
      },
      {
        description: 'Zerodha Kite - SELL NIFTY (Closed Position)',
        payload: {
          userId: user.id,
          symbol: 'NIFTY',
          entryPrice: 19500,
          exitPrice: 19400,
          quantity: 100,
          direction: 'SELL',
          status: 'CLOSED',
          timestamp: new Date().toISOString(),
          broker: 'ZERODHA',
          rawPayload: {
            source: 'kite.zerodha.com',
            orderType: 'MARKET',
            productType: 'CNC'
          }
        }
      },
      {
        description: 'Upstox - BUY RELIANCE (Open Position)',
        payload: {
          userId: user.id,
          symbol: 'RELIANCE',
          entryPrice: 2500,
          quantity: 200,
          direction: 'BUY',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
          broker: 'UPSTOX',
          rawPayload: {
            source: 'upstox.com',
            orderType: 'LIMIT',
            productType: 'DELIVERY'
          }
        }
      },
      {
        description: 'Zerodha Kite - BUY TCS (Closed Position with Profit)',
        payload: {
          userId: user.id,
          symbol: 'TCS',
          entryPrice: 3800,
          exitPrice: 3950,
          quantity: 75,
          direction: 'BUY',
          status: 'CLOSED',
          timestamp: new Date().toISOString(),
          broker: 'ZERODHA',
          rawPayload: {
            source: 'kite.zerodha.com',
            orderType: 'MARKET',
            productType: 'MIS'
          }
        }
      },
      {
        description: 'Upstox - SELL INFY (Closed Position with Loss)',
        payload: {
          userId: user.id,
          symbol: 'INFY',
          entryPrice: 1500,
          exitPrice: 1480,
          quantity: 300,
          direction: 'SELL',
          status: 'CLOSED',
          timestamp: new Date().toISOString(),
          broker: 'UPSTOX',
          rawPayload: {
            source: 'upstox.com',
            orderType: 'MARKET',
            productType: 'DELIVERY'
          }
        }
      }
    ];

    console.log('Simulating Chrome Extension Trade Capture...\n');

    // Process each trade scenario
    for (const scenario of tradeScenarios) {
      console.log(`📊 ${scenario.description}`);
      
      const response = await fetch('http://localhost:4000/api/trades/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.payload)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Trade captured successfully`);
        console.log(`   Symbol: ${result.trade.symbol}`);
        console.log(`   Direction: ${result.trade.direction}`);
        console.log(`   Status: ${result.trade.status}`);
        console.log(`   PnL: ${result.trade.pnl || 'N/A'}`);
        console.log(`   Trade ID: ${result.trade.id}\n`);
      } else {
        console.log(`❌ Failed to capture trade: ${result.error}\n`);
      }

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Get final user statistics
    console.log('📈 Final User Statistics:');
    const statsResponse = await fetch(`http://localhost:4000/api/trades/user/${user.id}/stats`);
    const statsResult = await statsResponse.json();
    
    if (statsResult.success) {
      const stats = statsResult.stats;
      console.log(`   Total Trades: ${stats.totalTrades}`);
      console.log(`   Winning Trades: ${stats.winningTrades}`);
      console.log(`   Losing Trades: ${stats.losingTrades}`);
      console.log(`   Win Rate: ${stats.winRate.toFixed(2)}%`);
      console.log(`   Total PnL: ₹${stats.totalPnL.toLocaleString()}`);
      console.log(`   Average PnL: ₹${stats.averagePnL.toLocaleString()}`);
    }

    // Get all user trades
    console.log('\n📋 All User Trades:');
    const tradesResponse = await fetch(`http://localhost:4000/api/trades/user/${user.id}`);
    const tradesResult = await tradesResponse.json();
    
    if (tradesResult.success) {
      tradesResult.trades.forEach((trade, index) => {
        console.log(`   ${index + 1}. ${trade.symbol} ${trade.direction} - ${trade.status}`);
        console.log(`      Entry: ₹${trade.entryPrice} | Exit: ${trade.exitPrice ? '₹' + trade.exitPrice : 'N/A'}`);
        console.log(`      Quantity: ${trade.quantity} | PnL: ${trade.pnl ? '₹' + trade.pnl : 'N/A'}`);
        console.log(`      Broker: ${trade.broker} | Time: ${new Date(trade.timestamp).toLocaleString()}\n`);
      });
    }

  } catch (error) {
    console.error('Error simulating Chrome extension:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateChromeExtension(); 