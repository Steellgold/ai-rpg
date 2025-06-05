-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "balanceBefore" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "balanceAfter" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "CreditPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditPackage_active_idx" ON "CreditPackage"("active");

-- CreateIndex
CREATE INDEX "CreditPackage_credits_idx" ON "CreditPackage"("credits");
