-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "ceilingHeight" DOUBLE PRECISION,
ADD COLUMN     "commercialPurpose" TEXT,
ADD COLUMN     "communicationTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "developerContact" TEXT,
ADD COLUMN     "developerName" TEXT,
ADD COLUMN     "heatingType" TEXT,
ADD COLUMN     "internalCode" TEXT,
ADD COLUMN     "internalDescription" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landArea" DOUBLE PRECISION,
ADD COLUMN     "layoutType" TEXT,
ADD COLUMN     "managerComment" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "ownerPhone" TEXT,
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "parkingType" TEXT,
ADD COLUMN     "paymentCondition" TEXT,
ADD COLUMN     "publicDescription" TEXT,
ADD COLUMN     "publicationNotes" TEXT,
ADD COLUMN     "realEstateClass" TEXT,
ADD COLUMN     "repairType" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "wallType" TEXT,
ADD COLUMN     "yearBuilt" INTEGER;

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "documentType" TEXT,
    "title" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMediaLink" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "mediaType" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyMediaLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPublication" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_idx" ON "PropertyDocument"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyMediaLink_propertyId_idx" ON "PropertyMediaLink"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyPublication_propertyId_idx" ON "PropertyPublication"("propertyId");

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMediaLink" ADD CONSTRAINT "PropertyMediaLink_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPublication" ADD CONSTRAINT "PropertyPublication_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
