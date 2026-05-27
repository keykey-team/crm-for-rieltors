-- Add last contact tracking to leads.
ALTER TABLE "Lead"
ADD COLUMN "lastContact" TIMESTAMP(3);

-- Align stored lead statuses with the funnel-stage based default.
ALTER TABLE "Lead"
ALTER COLUMN "status" SET DEFAULT 'new_lead';

UPDATE "Lead"
SET "status" = 'new_lead'
WHERE "status" = 'new';

-- Allow properties to participate in both sale and rent flows.
ALTER TABLE "Property"
ADD COLUMN "dealTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];