/*
  Warnings:

  - You are about to drop the column `likes` on the `Plugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "PluginLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pluginId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PluginLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PluginLike_pluginId_idx" ON "PluginLike"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "PluginLike_pluginId_userId_key" ON "PluginLike"("pluginId", "userId");

-- AddForeignKey
ALTER TABLE "PluginLike" ADD CONSTRAINT "PluginLike_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLike" ADD CONSTRAINT "PluginLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
