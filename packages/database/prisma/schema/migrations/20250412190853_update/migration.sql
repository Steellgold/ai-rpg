-- CreateEnum
CREATE TYPE "Pricing" AS ENUM ('FREE', 'PREMIUM', 'PAID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'PLUGIN_PURCHASE';
ALTER TYPE "TransactionType" ADD VALUE 'PLUGIN_USAGE';
ALTER TYPE "TransactionType" ADD VALUE 'PLUGIN_REFUND';
ALTER TYPE "TransactionType" ADD VALUE 'PLUGIN_ROYALTY';

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "pluginId" TEXT,
ADD COLUMN     "pluginPurchaseId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "creatorAmount" DOUBLE PRECISION,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "payoutId" TEXT,
ADD COLUMN     "payoutStatus" TEXT,
ADD COLUMN     "platformAmount" DOUBLE PRECISION,
ADD COLUMN     "pluginId" TEXT,
ADD COLUMN     "pluginPurchase" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Plugin" ADD COLUMN     "creditPrice" INTEGER,
ADD COLUMN     "creditsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "euroPrice" DOUBLE PRECISION,
ADD COLUMN     "moneyEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pricing" "Pricing" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "royaltyRate" DOUBLE PRECISION,
ADD COLUMN     "usageCredits" INTEGER;

-- AlterTable
ALTER TABLE "Usage" ADD COLUMN     "creditsUsed" INTEGER;

-- CreateTable
CREATE TABLE "PluginPurchase" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricing" "Pricing" NOT NULL,
    "creditsSpent" INTEGER,
    "moneySpent" DOUBLE PRECISION,
    "hasBeenUsed" BOOLEAN NOT NULL DEFAULT false,
    "firstUsedAt" TIMESTAMP(3),
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "paymentId" TEXT,

    CONSTRAINT "PluginPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PluginPurchase_userId_idx" ON "PluginPurchase"("userId");

-- CreateIndex
CREATE INDEX "PluginPurchase_pluginId_idx" ON "PluginPurchase"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "PluginPurchase_pluginId_userId_key" ON "PluginPurchase"("pluginId", "userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_pluginId_idx" ON "CreditTransaction"("pluginId");

-- CreateIndex
CREATE INDEX "Payment_pluginId_idx" ON "Payment"("pluginId");

-- CreateIndex
CREATE INDEX "Payment_creatorId_idx" ON "Payment"("creatorId");

-- CreateIndex
CREATE INDEX "Plugin_pricing_idx" ON "Plugin"("pricing");

-- AddForeignKey
ALTER TABLE "PluginPurchase" ADD CONSTRAINT "PluginPurchase_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginPurchase" ADD CONSTRAINT "PluginPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
