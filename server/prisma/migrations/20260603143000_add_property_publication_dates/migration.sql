-- AlterTable
ALTER TABLE "PropertyPublication"
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);