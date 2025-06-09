/*
  Warnings:

  - You are about to drop the column `priority` on the `Job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Job_priority_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "priority";
