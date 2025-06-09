/*
  Warnings:

  - You are about to drop the column `subscription_end` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_start` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_tier` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscription_end",
DROP COLUMN "subscription_id",
DROP COLUMN "subscription_start",
DROP COLUMN "subscription_status",
DROP COLUMN "subscription_tier",
ADD COLUMN     "stripe_customer_id" TEXT;
