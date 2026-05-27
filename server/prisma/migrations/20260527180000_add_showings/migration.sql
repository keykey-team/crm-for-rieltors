CREATE TABLE "Showing" (
  "id" TEXT NOT NULL,
  "dealId" TEXT,
  "propertyId" TEXT NOT NULL,
  "leadId" TEXT,
  "agentId" TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "durationMin" INTEGER NOT NULL DEFAULT 30,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "feedback" TEXT,
  "clientRating" INTEGER,
  "agentNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Showing_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Showing"
  ADD CONSTRAINT "Showing_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Showing"
  ADD CONSTRAINT "Showing_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Showing"
  ADD CONSTRAINT "Showing_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Showing"
  ADD CONSTRAINT "Showing_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Showing_dealId_idx" ON "Showing"("dealId");
CREATE INDEX "Showing_propertyId_idx" ON "Showing"("propertyId");
CREATE INDEX "Showing_leadId_idx" ON "Showing"("leadId");
CREATE INDEX "Showing_agentId_idx" ON "Showing"("agentId");
CREATE INDEX "Showing_scheduledAt_idx" ON "Showing"("scheduledAt");
CREATE INDEX "Showing_status_idx" ON "Showing"("status");
