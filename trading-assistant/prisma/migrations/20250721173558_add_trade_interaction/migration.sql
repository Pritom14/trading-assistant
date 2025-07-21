-- CreateTable
CREATE TABLE "TradeInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradeInteraction_userId_idx" ON "TradeInteraction"("userId");

-- CreateIndex
CREATE INDEX "TradeInteraction_tradeId_idx" ON "TradeInteraction"("tradeId");
