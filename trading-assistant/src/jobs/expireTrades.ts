import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function expireOldTrades() {
  const now = new Date();
  const result = await prisma.trade.updateMany({
    where: {
      validUntil: { lt: now },
      status: { not: 'expired' },
    },
    data: { status: 'expired' },
  });
  if (result.count > 0) {
    console.log(`[expireTrades] Marked ${result.count} trades as expired.`);
  }
} 