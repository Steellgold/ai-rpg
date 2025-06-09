/*
  Warnings:

  - You are about to drop the column `creatorAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payoutId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payoutStatus` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `platformAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `royaltyRate` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `PluginPurchase` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_creatorId_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "creatorAmount",
DROP COLUMN "creatorId",
DROP COLUMN "payoutId",
DROP COLUMN "payoutStatus",
DROP COLUMN "platformAmount",
ADD COLUMN     "application_fee_amount" DOUBLE PRECISION,
ADD COLUMN     "transfer_amount" DOUBLE PRECISION,
ADD COLUMN     "transfer_id" TEXT,
ALTER COLUMN "provider" SET DEFAULT 'stripe';

-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "royaltyRate",
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_product_id" TEXT;

-- AlterTable
ALTER TABLE "PluginPurchase" DROP COLUMN "paymentId",
ADD COLUMN     "stripe_application_fee_id" TEXT,
ADD COLUMN     "stripe_charge_id" TEXT,
ADD COLUMN     "stripe_payment_intent_id" TEXT,
ADD COLUMN     "stripe_transfer_id" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "can_receive_payments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripe_connect_date" TIMESTAMP(3),
ADD COLUMN     "stripe_connect_id" TEXT,
ADD COLUMN     "stripe_connect_status" TEXT;

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL,
    "stripe_payout_id" TEXT NOT NULL,
    "stripe_transfer_id" TEXT,
    "pluginIds" TEXT[],
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_userId_idx" ON "Payout"("userId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_stripe_payout_id_idx" ON "Payout"("stripe_payout_id");

-- CreateIndex
CREATE INDEX "PluginPurchase_stripe_payment_intent_id_idx" ON "PluginPurchase"("stripe_payment_intent_id");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
