/*
  Warnings:

  - You are about to drop the column `audience` on the `Story` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameSave" ALTER COLUMN "name" SET DEFAULT 'Save';

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "audience",
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "genre" TEXT[];

-- DropEnum
DROP TYPE "Audience";
