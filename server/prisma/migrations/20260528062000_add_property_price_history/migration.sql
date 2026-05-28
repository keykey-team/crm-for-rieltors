CREATE TABLE "PropertyPriceHistory" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "changedBy" TEXT,
  "reason" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PropertyPriceHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PropertyPriceHistory"
ADD CONSTRAINT "PropertyPriceHistory_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyPriceHistory"
ADD CONSTRAINT "PropertyPriceHistory_changedBy_fkey"
FOREIGN KEY ("changedBy") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "PropertyPriceHistory_propertyId_idx" ON "PropertyPriceHistory"("propertyId");
CREATE INDEX "PropertyPriceHistory_createdAt_idx" ON "PropertyPriceHistory"("createdAt");
