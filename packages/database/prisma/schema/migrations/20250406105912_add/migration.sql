-- CreateEnum
CREATE TYPE "StoryVGenerated" AS ENUM ('V1', 'V2');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "v" "StoryVGenerated" NOT NULL DEFAULT 'V1';
