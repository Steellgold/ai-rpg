/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Story` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Story" DROP COLUMN "difficulty",
ADD COLUMN     "current_scene" INTEGER DEFAULT 0,
ADD COLUMN     "max_scenes" INTEGER DEFAULT 20;

-- DropEnum
DROP TYPE "Difficulty";
