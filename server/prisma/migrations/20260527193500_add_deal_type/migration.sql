ALTER TABLE "Deal"
ADD COLUMN "dealType" TEXT;

UPDATE "Deal" d
SET "dealType" = sub."dealType"
FROM (
  SELECT p.id, p."dealTypes"[1] AS "dealType"
  FROM "Property" p
) sub
WHERE d."propertyId" = sub.id
  AND d."dealType" IS NULL
  AND sub."dealType" IS NOT NULL;