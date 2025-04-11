-- AlterEnum
ALTER TYPE "Audience" ADD VALUE 'All_Ages';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "daily_limit_messages" INTEGER DEFAULT 15;
