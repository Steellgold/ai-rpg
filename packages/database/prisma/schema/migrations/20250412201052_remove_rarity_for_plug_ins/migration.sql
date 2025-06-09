/*
  Warnings:

  - You are about to drop the column `rarity` on the `Plugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "rarity";

-- DropEnum
DROP TYPE "PluginRarity";
