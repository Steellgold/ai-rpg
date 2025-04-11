/*
  Warnings:

  - You are about to drop the column `daily_limit_messages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `limit_messages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `premium` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "daily_limit_messages",
DROP COLUMN "limit_messages",
DROP COLUMN "premium";
