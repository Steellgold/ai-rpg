/*
  Warnings:

  - You are about to drop the column `characterClass` on the `GameState` table. All the data in the column will be lost.
  - Added the required column `characterDescription` to the `GameState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameState" DROP COLUMN "characterClass",
ADD COLUMN     "characterDescription" TEXT NOT NULL;
