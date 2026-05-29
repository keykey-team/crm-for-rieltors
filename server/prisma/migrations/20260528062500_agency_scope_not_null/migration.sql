DO $$
DECLARE
	default_owner_id TEXT;
	default_agency_id TEXT;
	null_scoped_rows INTEGER;
BEGIN
	SELECT id INTO default_owner_id
	FROM "User"
	ORDER BY
		CASE role
			WHEN 'admin' THEN 0
			WHEN 'director' THEN 1
			ELSE 2
		END,
		"createdAt" ASC
	LIMIT 1;

	IF default_owner_id IS NULL THEN
		SELECT
			(SELECT COUNT(*) FROM "Lead" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Property" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Deal" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Task" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Event" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "KnowledgeArticle" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Automation" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Template" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "ActivityLog" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Funnel" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Communication" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "AftercarePlan" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "Dictionary" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "ChatRoom" WHERE "agencyId" IS NULL) +
			(SELECT COUNT(*) FROM "LeadDistributionRule" WHERE "agencyId" IS NULL)
		INTO null_scoped_rows;

		IF null_scoped_rows > 0 THEN
			RAISE EXCEPTION 'Cannot backfill agencyId: no users exist to own the default agency.';
		END IF;
	ELSE
		INSERT INTO "Agency" ("id", "name", "slug", "plan", "ownerId", "createdAt", "updatedAt")
		VALUES ('default-agency', 'Default Agency', 'default', 'free', default_owner_id, NOW(), NOW())
		ON CONFLICT ("slug") DO UPDATE
			SET "ownerId" = COALESCE("Agency"."ownerId", EXCLUDED."ownerId"),
					"updatedAt" = NOW();

		SELECT id INTO default_agency_id FROM "Agency" WHERE slug = 'default' LIMIT 1;

		INSERT INTO "AgencyMembership" ("id", "agencyId", "userId", "role", "isActive", "joinedAt")
		SELECT 'default-membership-' || id, default_agency_id, id, COALESCE(role, 'agent'), true, NOW()
		FROM "User"
		ON CONFLICT ("agencyId", "userId") DO UPDATE
			SET "role" = EXCLUDED."role",
					"isActive" = true;

		UPDATE "User" SET "lastAgencyId" = default_agency_id WHERE "lastAgencyId" IS NULL;
		UPDATE "Lead" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Property" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Deal" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Task" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Event" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "KnowledgeArticle" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Automation" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Template" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "ActivityLog" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Funnel" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Communication" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "AftercarePlan" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "Dictionary" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "ChatRoom" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
		UPDATE "LeadDistributionRule" SET "agencyId" = default_agency_id WHERE "agencyId" IS NULL;
	END IF;
END $$;

ALTER TABLE "Lead" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Property" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Deal" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "KnowledgeArticle" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Automation" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Template" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "ActivityLog" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Funnel" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Communication" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "AftercarePlan" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Dictionary" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "ChatRoom" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "LeadDistributionRule" ALTER COLUMN "agencyId" SET NOT NULL;
