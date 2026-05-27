ALTER TABLE "Deal"
ADD COLUMN "funnelId" TEXT;

ALTER TABLE "Deal"
ADD CONSTRAINT "Deal_funnelId_fkey"
FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Deal_funnelId_idx" ON "Deal"("funnelId");

UPDATE "Deal" AS d
SET "funnelId" = fs."funnelId"
FROM "FunnelStage" AS fs
WHERE d."funnelId" IS NULL
  AND fs."isActive" = true
  AND fs."funnelId" IS NOT NULL
  AND fs."value" = d."stage";

UPDATE "Deal" AS d
SET "funnelId" = fallback."id"
FROM (
  SELECT "id"
  FROM "Funnel"
  WHERE "isActive" = true
  ORDER BY "isDefault" DESC, "order" ASC
  LIMIT 1
) AS fallback
WHERE d."funnelId" IS NULL;