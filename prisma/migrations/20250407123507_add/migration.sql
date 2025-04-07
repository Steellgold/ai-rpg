/*
  Warnings:

  - You are about to drop the column `limit_messages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `premium` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SUBSCRIPTION', 'USAGE', 'REFUND', 'BONUS', 'ADMIN_ADJUST');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "credit_cost" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "limit_messages",
DROP COLUMN "premium",
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "last_credits_refresh" TIMESTAMP(3),
ADD COLUMN     "subscription_end" TIMESTAMP(3),
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_start" TIMESTAMP(3),
ADD COLUMN     "subscription_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "subscription_tier" TEXT NOT NULL DEFAULT 'basic';

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "featureId" TEXT,
    "storyId" TEXT,
    "jobId" TEXT,
    "paymentId" TEXT,
    "paymentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryFeature" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "creditCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "credits_amount" INTEGER,
    "is_subscription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_storyId_idx" ON "CreditTransaction"("storyId");

-- CreateIndex
CREATE INDEX "CreditTransaction_jobId_idx" ON "CreditTransaction"("jobId");

-- CreateIndex
CREATE INDEX "CreditTransaction_transactionType_idx" ON "CreditTransaction"("transactionType");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "StoryFeature_storyId_idx" ON "StoryFeature"("storyId");

-- CreateIndex
CREATE INDEX "StoryFeature_featureId_idx" ON "StoryFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryFeature_storyId_featureId_key" ON "StoryFeature"("storyId", "featureId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_provider_id_idx" ON "Payment"("provider_id");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Job_priority_idx" ON "Job"("priority");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryFeature" ADD CONSTRAINT "StoryFeature_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
