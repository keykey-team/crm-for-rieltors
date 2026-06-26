export interface PropertyQuery {
  search?: string;
  status?: string;
  type?: string;
  dealType?: string;
  publicationChannel?: string;
  publicationStatus?: string;
}

export interface PropertyPayload {
  internalCode?: unknown;
  source?: unknown;
  ownerName?: unknown;
  ownerPhone?: unknown;
  developerName?: unknown;
  developerContact?: unknown;
  rooms?: unknown;
  bedrooms?: unknown;
  bathrooms?: unknown;
  area?: unknown;
  landArea?: unknown;
  floor?: unknown;
  totalFloors?: unknown;
  price?: unknown;
  currency?: unknown;
  paymentCondition?: unknown;
  communicationTypes?: unknown;
  tags?: unknown;
  isPublished?: unknown;
  isFeatured?: unknown;
  publicationNotes?: unknown;
  district?: unknown;
  city?: unknown;
  layoutType?: unknown;
  repairType?: unknown;
  heatingType?: unknown;
  wallType?: unknown;
  realEstateClass?: unknown;
  commercialPurpose?: unknown;
  parkingType?: unknown;
  parkingSpaces?: unknown;
  yearBuilt?: unknown;
  ceilingHeight?: unknown;
  managerComment?: unknown;
  internalDescription?: unknown;
  publicDescription?: unknown;
  description?: unknown;
  dealTypes?: unknown;
  documents?: unknown;
  mediaLinks?: unknown;
  publications?: unknown;
  photos?: unknown;
  priceHistoryReason?: unknown;
  priceHistoryNote?: unknown;
  [key: string]: unknown;
}
