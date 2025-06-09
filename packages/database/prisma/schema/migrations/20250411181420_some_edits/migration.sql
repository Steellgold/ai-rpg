/*
  Warnings:

  - The `personality` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `outfit` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `background` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `abilities` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `relationships` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `motivations` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flaws` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `backstory` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ChoiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameSave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaveHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SceneCharacter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SceneItem` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `age` on table `Character` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChoiceItem" DROP CONSTRAINT "ChoiceItem_choiceId_fkey";

-- DropForeignKey
ALTER TABLE "ChoiceItem" DROP CONSTRAINT "ChoiceItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "GameSave" DROP CONSTRAINT "GameSave_storyId_fkey";

-- DropForeignKey
ALTER TABLE "GameSave" DROP CONSTRAINT "GameSave_userId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_gameSaveId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SaveHistory" DROP CONSTRAINT "SaveHistory_choiceId_fkey";

-- DropForeignKey
ALTER TABLE "SaveHistory" DROP CONSTRAINT "SaveHistory_gameSaveId_fkey";

-- DropForeignKey
ALTER TABLE "SceneCharacter" DROP CONSTRAINT "SceneCharacter_characterId_fkey";

-- DropForeignKey
ALTER TABLE "SceneCharacter" DROP CONSTRAINT "SceneCharacter_sceneId_fkey";

-- DropForeignKey
ALTER TABLE "SceneItem" DROP CONSTRAINT "SceneItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SceneItem" DROP CONSTRAINT "SceneItem_sceneId_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "personality",
ADD COLUMN     "personality" JSONB,
DROP COLUMN "outfit",
ADD COLUMN     "outfit" JSONB,
ALTER COLUMN "age" SET NOT NULL,
DROP COLUMN "background",
ADD COLUMN     "background" JSONB,
DROP COLUMN "abilities",
ADD COLUMN     "abilities" JSONB,
DROP COLUMN "relationships",
ADD COLUMN     "relationships" JSONB,
DROP COLUMN "motivations",
ADD COLUMN     "motivations" JSONB,
DROP COLUMN "flaws",
ADD COLUMN     "flaws" JSONB,
DROP COLUMN "backstory",
ADD COLUMN     "backstory" JSONB;

-- DropTable
DROP TABLE "ChoiceItem";

-- DropTable
DROP TABLE "GameSave";

-- DropTable
DROP TABLE "InventoryItem";

-- DropTable
DROP TABLE "SaveHistory";

-- DropTable
DROP TABLE "SceneCharacter";

-- DropTable
DROP TABLE "SceneItem";
