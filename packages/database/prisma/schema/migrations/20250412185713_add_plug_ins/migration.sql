-- CreateEnum
CREATE TYPE "PluginStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PluginType" AS ENUM ('NARRATIVE', 'INTRIGUE', 'CHARACTER', 'WORLD', 'OBJECT', 'THEME', 'STYLE', 'MECHANICS');

-- CreateEnum
CREATE TYPE "PluginRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "Plugin" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "banner" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "authorId" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "examples" TEXT,
    "type" "PluginType" NOT NULL DEFAULT 'NARRATIVE',
    "rarity" "PluginRarity" NOT NULL DEFAULT 'COMMON',
    "status" "PluginStatus" NOT NULL DEFAULT 'PENDING',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT,
    "parameters" JSONB,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pluginId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pluginId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionPlugin" (
    "collectionId" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionPlugin_pkey" PRIMARY KEY ("collectionId","pluginId")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expected" JSONB NOT NULL,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PluginToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PluginToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Plugin_type_idx" ON "Plugin"("type");

-- CreateIndex
CREATE INDEX "Plugin_authorId_idx" ON "Plugin"("authorId");

-- CreateIndex
CREATE INDEX "Plugin_status_idx" ON "Plugin"("status");

-- CreateIndex
CREATE INDEX "Plugin_featured_idx" ON "Plugin"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_pluginId_userId_key" ON "Review"("pluginId", "userId");

-- CreateIndex
CREATE INDEX "Usage_pluginId_idx" ON "Usage"("pluginId");

-- CreateIndex
CREATE INDEX "Usage_storyId_idx" ON "Usage"("storyId");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "TestCase_pluginId_idx" ON "TestCase"("pluginId");

-- CreateIndex
CREATE INDEX "_PluginToTag_B_index" ON "_PluginToTag"("B");

-- AddForeignKey
ALTER TABLE "Plugin" ADD CONSTRAINT "Plugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPlugin" ADD CONSTRAINT "CollectionPlugin_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPlugin" ADD CONSTRAINT "CollectionPlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PluginToTag" ADD CONSTRAINT "_PluginToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PluginToTag" ADD CONSTRAINT "_PluginToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
