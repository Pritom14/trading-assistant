import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('Latest 5 trades:');
  for (const trade of trades) {
    console.log({
      id: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      entry: trade.entry,
      stop: trade.stop,
      target: trade.target,
      confidence: trade.confidence,
      rr: trade.rr,
      trailingStop: trade.trailingStop,
      origin: trade.origin,
      createdAt: trade.createdAt,
      validUntil: trade.validUntil,
      confidenceFactors: trade.confidenceFactors,
      status: trade.status,
      delivered: trade.delivered,
    });
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 