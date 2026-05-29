CREATE TABLE "Funnel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Funnel_order_idx" ON "Funnel"("order");

INSERT INTO "Funnel" ("id", "name", "isDefault", "isActive", "order", "createdAt", "updatedAt")
SELECT 'default-funnel', 'Default funnel', true, true, 0, NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM "FunnelStage")
  OR EXISTS (SELECT 1 FROM "Deal");

ALTER TABLE "FunnelStage"
ADD COLUMN "funnelId" TEXT;

ALTER TABLE "FunnelStage"
ADD CONSTRAINT "FunnelStage_funnelId_fkey"
FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FunnelStage_funnelId_idx" ON "FunnelStage"("funnelId");

UPDATE "FunnelStage"
SET "funnelId" = 'default-funnel'
WHERE "funnelId" IS NULL;

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