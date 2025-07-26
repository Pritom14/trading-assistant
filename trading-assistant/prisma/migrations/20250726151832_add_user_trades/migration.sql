-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'REJECTED');

-- CreateTable
CREATE TABLE "UserTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "direction" "TradeDirection" NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "pnl" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "broker" TEXT NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTrade_userId_idx" ON "UserTrade"("userId");

-- CreateIndex
CREATE INDEX "UserTrade_symbol_idx" ON "UserTrade"("symbol");

-- CreateIndex
CREATE INDEX "UserTrade_broker_idx" ON "UserTrade"("broker");

-- CreateIndex
CREATE INDEX "UserTrade_timestamp_idx" ON "UserTrade"("timestamp");

-- AddForeignKey
ALTER TABLE "UserTrade" ADD CONSTRAINT "UserTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
