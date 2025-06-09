/*
  Warnings:

  - You are about to drop the column `euroPrice` on the `Plugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "euroPrice",
ADD COLUMN     "dollarPrice" DOUBLE PRECISION;
