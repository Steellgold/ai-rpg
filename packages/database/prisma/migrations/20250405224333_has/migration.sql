-- AlterTable
ALTER TABLE "Choice" ADD COLUMN     "isItemRelated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "hasItems" BOOLEAN NOT NULL DEFAULT false;
