-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "forkedFromId" TEXT;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
