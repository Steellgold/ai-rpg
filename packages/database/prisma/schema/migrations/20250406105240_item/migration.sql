-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "isBroken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remainingUses" INTEGER;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "brokenImageUrl" TEXT,
ADD COLUMN     "durability" INTEGER,
ADD COLUMN     "isBroken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_mentioned_in" TEXT,
ADD COLUMN     "usage_count" INTEGER;
