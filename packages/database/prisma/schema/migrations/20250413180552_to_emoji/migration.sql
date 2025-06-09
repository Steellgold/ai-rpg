/*
  Warnings:

  - You are about to drop the column `icon` on the `Plugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "icon",
ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '🪶';
