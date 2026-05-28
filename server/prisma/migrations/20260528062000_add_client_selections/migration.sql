CREATE TABLE "ClientSelection" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "publicSlug" TEXT NOT NULL,
  "title" TEXT,
  "message" TEXT,
  "expiresAt" TIMESTAMP(3),
  "viewsCount" INTEGER NOT NULL DEFAULT 0,
  "lastViewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientSelection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SelectionItem" (
  "id" TEXT NOT NULL,
  "selectionId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "agentComment" TEXT,
  "clientReaction" TEXT,
  "clientNote" TEXT,
  "reactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SelectionItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientSelection_publicSlug_key" ON "ClientSelection"("publicSlug");
CREATE INDEX "ClientSelection_leadId_idx" ON "ClientSelection"("leadId");
CREATE INDEX "ClientSelection_createdById_idx" ON "ClientSelection"("createdById");
CREATE INDEX "ClientSelection_publicSlug_idx" ON "ClientSelection"("publicSlug");

CREATE UNIQUE INDEX "SelectionItem_selectionId_propertyId_key" ON "SelectionItem"("selectionId", "propertyId");
CREATE INDEX "SelectionItem_selectionId_idx" ON "SelectionItem"("selectionId");

ALTER TABLE "ClientSelection"
  ADD CONSTRAINT "ClientSelection_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientSelection"
  ADD CONSTRAINT "ClientSelection_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SelectionItem"
  ADD CONSTRAINT "SelectionItem_selectionId_fkey"
  FOREIGN KEY ("selectionId") REFERENCES "ClientSelection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SelectionItem"
  ADD CONSTRAINT "SelectionItem_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
