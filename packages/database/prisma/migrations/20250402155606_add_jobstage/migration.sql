/*
  Warnings:

  - You are about to drop the column `type` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStage" AS ENUM ('INITIALIZED', 'GENERATING_STORY', 'CREATING_STORY', 'CREATING_MAIN_CHARS', 'CREATING_SEC_CHARS', 'CREATING_FIRST_SCENE', 'GENERATING_BANNER', 'UPLOADING_BANNER', 'GENERATING_SCENE_IMG', 'UPLOADING_SCENE_IMG', 'FINALIZING');

-- DropIndex
DROP INDEX "Job_type_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "type",
ADD COLUMN     "stage" "JobStage" DEFAULT 'INITIALIZED',
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "JobType";

-- CreateIndex
CREATE INDEX "Job_stage_idx" ON "Job"("stage");
