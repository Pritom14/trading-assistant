/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `tsl` on the `Trade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "timestamp",
DROP COLUMN "tsl",
ADD COLUMN     "confidenceFactors" JSONB,
ADD COLUMN     "delivered" BOOLEAN,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "trailingStop" DOUBLE PRECISION,
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_origin_idx" ON "Trade"("origin");
