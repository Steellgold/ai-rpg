/*
  Warnings:

  - You are about to drop the column `daily_limit_messages` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "daily_limit_messages",
ADD COLUMN     "limit_messages" INTEGER DEFAULT 15;
