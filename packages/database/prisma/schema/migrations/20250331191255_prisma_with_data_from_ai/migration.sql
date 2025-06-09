/*
  Warnings:

  - You are about to drop the column `gameStateId` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the `GameState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoryEntry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sceneId` to the `Choice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "NarrativeStyle" AS ENUM ('FirstPerson', 'SecondPerson', 'ThirdPerson');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('Children', 'YoungAdult', 'Adult');

-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_gameStateId_fkey";

-- DropForeignKey
ALTER TABLE "GameState" DROP CONSTRAINT "GameState_userId_fkey";

-- DropForeignKey
ALTER TABLE "HistoryEntry" DROP CONSTRAINT "HistoryEntry_gameStateId_fkey";

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "gameStateId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sceneId" TEXT NOT NULL;

-- DropTable
DROP TABLE "GameState";

-- DropTable
DROP TABLE "HistoryEntry";

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "possibleEndings" TEXT[],
    "narrativeStyle" "NarrativeStyle" NOT NULL,
    "audience" "Audience" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personality" TEXT,
    "outfit" TEXT,
    "age" INTEGER,
    "background" TEXT,
    "abilities" TEXT[],
    "relationships" TEXT[],
    "motivations" TEXT,
    "flaws" TEXT,
    "backstory" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "storyId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "storyId" TEXT NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneTransition" (
    "id" TEXT NOT NULL,
    "sourceSceneId" TEXT NOT NULL,
    "destinationSceneId" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,

    CONSTRAINT "SceneTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneCharacter" (
    "id" TEXT NOT NULL,
    "role" TEXT,
    "sceneId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "SceneCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSave" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Sauvegarde',
    "characterName" TEXT NOT NULL,
    "characterClass" TEXT,
    "lastPlayed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentSceneId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaveHistory" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameSaveId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "choiceId" TEXT,

    CONSTRAINT "SaveHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_creatorId_idx" ON "Story"("creatorId");

-- CreateIndex
CREATE INDEX "Character_storyId_idx" ON "Character"("storyId");

-- CreateIndex
CREATE INDEX "Scene_storyId_idx" ON "Scene"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneTransition_sourceSceneId_choiceId_key" ON "SceneTransition"("sourceSceneId", "choiceId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneCharacter_sceneId_characterId_key" ON "SceneCharacter"("sceneId", "characterId");

-- CreateIndex
CREATE INDEX "GameSave_userId_idx" ON "GameSave"("userId");

-- CreateIndex
CREATE INDEX "GameSave_storyId_idx" ON "GameSave"("storyId");

-- CreateIndex
CREATE INDEX "SaveHistory_gameSaveId_idx" ON "SaveHistory"("gameSaveId");

-- CreateIndex
CREATE INDEX "Choice_sceneId_idx" ON "Choice"("sceneId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneTransition" ADD CONSTRAINT "SceneTransition_sourceSceneId_fkey" FOREIGN KEY ("sourceSceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneTransition" ADD CONSTRAINT "SceneTransition_destinationSceneId_fkey" FOREIGN KEY ("destinationSceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneTransition" ADD CONSTRAINT "SceneTransition_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCharacter" ADD CONSTRAINT "SceneCharacter_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCharacter" ADD CONSTRAINT "SceneCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSave" ADD CONSTRAINT "GameSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSave" ADD CONSTRAINT "GameSave_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveHistory" ADD CONSTRAINT "SaveHistory_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "GameSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveHistory" ADD CONSTRAINT "SaveHistory_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
