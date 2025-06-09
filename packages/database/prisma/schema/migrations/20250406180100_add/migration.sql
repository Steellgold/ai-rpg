-- CreateEnum
CREATE TYPE "StoryLanguage" AS ENUM ('auto', 'en', 'fr', 'es', 'it', 'de');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "language" "StoryLanguage" NOT NULL DEFAULT 'auto';
