/*
  Warnings:

  - The values [PREMIUM] on the enum `Pricing` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `banner` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `configuration` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `creditPrice` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `creditsEarned` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `dollarPrice` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `examples` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `moneyEarned` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `promptTokens` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseCount` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `usageCredits` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the column `creditsSpent` on the `PluginPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `moneySpent` on the `PluginPurchase` table. All the data in the column will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionPlugin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestCase` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Pricing_new" AS ENUM ('FREE', 'CREDITS', 'PAID');
ALTER TABLE "Plugin" ALTER COLUMN "pricing" DROP DEFAULT;
ALTER TABLE "Plugin" ALTER COLUMN "pricing" TYPE "Pricing_new" USING ("pricing"::text::"Pricing_new");
ALTER TABLE "PluginPurchase" ALTER COLUMN "pricing" TYPE "Pricing_new" USING ("pricing"::text::"Pricing_new");
ALTER TYPE "Pricing" RENAME TO "Pricing_old";
ALTER TYPE "Pricing_new" RENAME TO "Pricing";
DROP TYPE "Pricing_old";
ALTER TABLE "Plugin" ALTER COLUMN "pricing" SET DEFAULT 'FREE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionPlugin" DROP CONSTRAINT "CollectionPlugin_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionPlugin" DROP CONSTRAINT "CollectionPlugin_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_pluginId_fkey";

-- DropIndex
DROP INDEX "Plugin_featured_idx";

-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "banner",
DROP COLUMN "code",
DROP COLUMN "configuration",
DROP COLUMN "creditPrice",
DROP COLUMN "creditsEarned",
DROP COLUMN "dollarPrice",
DROP COLUMN "examples",
DROP COLUMN "featured",
DROP COLUMN "moneyEarned",
DROP COLUMN "promptTokens",
DROP COLUMN "purchaseCount",
DROP COLUMN "usageCredits",
DROP COLUMN "version",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "usage" INTEGER;

-- AlterTable
ALTER TABLE "PluginPurchase" DROP COLUMN "creditsSpent",
DROP COLUMN "moneySpent",
ADD COLUMN     "spent" INTEGER;

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "CollectionPlugin";

-- DropTable
DROP TABLE "TestCase";

-- CreateIndex
CREATE INDEX "Plugin_isFeatured_idx" ON "Plugin"("isFeatured");
