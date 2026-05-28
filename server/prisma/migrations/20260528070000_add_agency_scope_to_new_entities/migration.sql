-- Add agencyId to Showing, PropertyPriceHistory, ClientSelection, SelectionItem
-- These entities were created before the multi-tenant agency scope was introduced (PR#35)
-- All new entities must have agencyId for tenant isolation

-- AddColumn Showing.agencyId
ALTER TABLE "Showing" ADD COLUMN "agencyId" TEXT;

-- Backfill: set agencyId from the property's agencyId (skip orphaned records)
UPDATE "Showing" s
SET "agencyId" = p."agencyId"
FROM "Property" p
WHERE s."propertyId" = p.id
  AND p."agencyId" IS NOT NULL;

-- Delete orphaned Showing records that could not be backfilled
DELETE FROM "Showing" WHERE "agencyId" IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE "Showing" ALTER COLUMN "agencyId" SET NOT NULL;

-- AddForeignKey Showing -> Agency
ALTER TABLE "Showing" ADD CONSTRAINT "Showing_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex Showing.agencyId
CREATE INDEX "Showing_agencyId_idx" ON "Showing"("agencyId");

-- AddColumn PropertyPriceHistory.agencyId
ALTER TABLE "PropertyPriceHistory" ADD COLUMN "agencyId" TEXT;

-- Backfill: set agencyId from the property's agencyId (skip orphaned records)
UPDATE "PropertyPriceHistory" pph
SET "agencyId" = p."agencyId"
FROM "Property" p
WHERE pph."propertyId" = p.id
  AND p."agencyId" IS NOT NULL;

-- Delete orphaned PropertyPriceHistory records that could not be backfilled
DELETE FROM "PropertyPriceHistory" WHERE "agencyId" IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE "PropertyPriceHistory" ALTER COLUMN "agencyId" SET NOT NULL;

-- AddForeignKey PropertyPriceHistory -> Agency
ALTER TABLE "PropertyPriceHistory" ADD CONSTRAINT "PropertyPriceHistory_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex PropertyPriceHistory.agencyId
CREATE INDEX "PropertyPriceHistory_agencyId_idx" ON "PropertyPriceHistory"("agencyId");

-- AddColumn ClientSelection.agencyId
ALTER TABLE "ClientSelection" ADD COLUMN "agencyId" TEXT;

-- Backfill: set agencyId from the lead's agencyId (skip orphaned records)
UPDATE "ClientSelection" cs
SET "agencyId" = l."agencyId"
FROM "Lead" l
WHERE cs."leadId" = l.id
  AND l."agencyId" IS NOT NULL;

-- Delete orphaned ClientSelection records (and their items) that could not be backfilled
DELETE FROM "SelectionItem" si
USING "ClientSelection" cs
WHERE si."selectionId" = cs.id
  AND cs."agencyId" IS NULL;
DELETE FROM "ClientSelection" WHERE "agencyId" IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE "ClientSelection" ALTER COLUMN "agencyId" SET NOT NULL;

-- AddForeignKey ClientSelection -> Agency
ALTER TABLE "ClientSelection" ADD CONSTRAINT "ClientSelection_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex ClientSelection.agencyId
CREATE INDEX "ClientSelection_agencyId_idx" ON "ClientSelection"("agencyId");

-- AddColumn SelectionItem.agencyId
ALTER TABLE "SelectionItem" ADD COLUMN "agencyId" TEXT;

-- Backfill: set agencyId from the ClientSelection's agencyId
UPDATE "SelectionItem" si
SET "agencyId" = cs."agencyId"
FROM "ClientSelection" cs
WHERE si."selectionId" = cs.id;

-- Delete any remaining orphaned SelectionItem records
DELETE FROM "SelectionItem" WHERE "agencyId" IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE "SelectionItem" ALTER COLUMN "agencyId" SET NOT NULL;

-- AddForeignKey SelectionItem -> Agency
ALTER TABLE "SelectionItem" ADD CONSTRAINT "SelectionItem_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex SelectionItem.agencyId
CREATE INDEX "SelectionItem_agencyId_idx" ON "SelectionItem"("agencyId");
