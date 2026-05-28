CREATE TABLE "Agency" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'free',
  "ownerId" TEXT NOT NULL,
  "brandLogo" TEXT,
  "brandName" TEXT,
  "primaryColor" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgencyMembership" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'agent',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "invitedBy" TEXT,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgencyMembership_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN "lastAgencyId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Property" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Deal" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Task" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Event" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "KnowledgeArticle" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Automation" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Template" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Funnel" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Communication" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "AftercarePlan" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "Dictionary" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "ChatRoom" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "LeadDistributionRule" ADD COLUMN "agencyId" TEXT;

CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");
CREATE UNIQUE INDEX "AgencyMembership_agencyId_userId_key" ON "AgencyMembership"("agencyId", "userId");

CREATE INDEX "Agency_ownerId_idx" ON "Agency"("ownerId");
CREATE INDEX "AgencyMembership_userId_idx" ON "AgencyMembership"("userId");
CREATE INDEX "AgencyMembership_agencyId_idx" ON "AgencyMembership"("agencyId");
CREATE INDEX "Lead_agencyId_idx" ON "Lead"("agencyId");
CREATE INDEX "Property_agencyId_idx" ON "Property"("agencyId");
CREATE INDEX "Deal_agencyId_idx" ON "Deal"("agencyId");
CREATE INDEX "Task_agencyId_idx" ON "Task"("agencyId");
CREATE INDEX "Event_agencyId_idx" ON "Event"("agencyId");
CREATE INDEX "KnowledgeArticle_agencyId_idx" ON "KnowledgeArticle"("agencyId");
CREATE INDEX "Automation_agencyId_idx" ON "Automation"("agencyId");
CREATE INDEX "Template_agencyId_idx" ON "Template"("agencyId");
CREATE INDEX "ActivityLog_agencyId_idx" ON "ActivityLog"("agencyId");
CREATE INDEX "Funnel_agencyId_idx" ON "Funnel"("agencyId");
CREATE INDEX "Communication_agencyId_idx" ON "Communication"("agencyId");
CREATE INDEX "AftercarePlan_agencyId_idx" ON "AftercarePlan"("agencyId");
CREATE INDEX "Dictionary_agencyId_idx" ON "Dictionary"("agencyId");
CREATE INDEX "ChatRoom_agencyId_idx" ON "ChatRoom"("agencyId");
CREATE INDEX "LeadDistributionRule_agencyId_idx" ON "LeadDistributionRule"("agencyId");

ALTER TABLE "Agency"
  ADD CONSTRAINT "Agency_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AgencyMembership"
  ADD CONSTRAINT "AgencyMembership_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgencyMembership"
  ADD CONSTRAINT "AgencyMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Template" ADD CONSTRAINT "Template_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AftercarePlan" ADD CONSTRAINT "AftercarePlan_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dictionary" ADD CONSTRAINT "Dictionary_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadDistributionRule" ADD CONSTRAINT "LeadDistributionRule_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "Dictionary_category_value_key";
CREATE UNIQUE INDEX "Dictionary_agencyId_category_value_key" ON "Dictionary"("agencyId", "category", "value");
