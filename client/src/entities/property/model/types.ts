export interface PropertyPhoto {
  id?: string;
  url?: string;
  cloudStoragePath?: string;
  isPublic?: boolean;
  order?: number;
}

export interface PropertyPhotoInput {
  cloudStoragePath: string;
  isPublic?: boolean;
}

export interface PropertyDocument {
  id?: string;
  title: string;
  documentType?: string | null;
  url?: string;
  cloudStoragePath: string;
  createdAt?: string;
}

export interface PropertyDocumentInput {
  title: string;
  documentType?: string;
  cloudStoragePath: string;
}

export interface PropertyMediaLink {
  id?: string;
  title: string;
  mediaType?: string | null;
  url: string;
  createdAt?: string;
}

export interface PropertyMediaLinkInput {
  title: string;
  mediaType?: string;
  url: string;
}

export interface PropertyPublication {
  id?: string;
  channel: string;
  status: string;
  url?: string | null;
  note?: string | null;
  publishedAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt?: string;
}

export interface PropertyPublicationInput {
  channel: string;
  status: string;
  url?: string;
  note?: string;
  publishedAt?: string;
  lastSyncedAt?: string;
}

export interface Property {
  id: string;
  title: string;
  internalCode?: string | null;
  type?: string | null;
  source?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  developerName?: string | null;
  developerContact?: string | null;
  status?: string | null;
  dealTypes?: string[] | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  landArea?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  price?: number | null;
  currency?: string | null;
  paymentCondition?: string | null;
  communicationTypes?: string[] | null;
  tags?: string[] | null;
  isPublished?: boolean | null;
  isFeatured?: boolean | null;
  publicationNotes?: string | null;
  publications?: PropertyPublication[];
  layoutType?: string | null;
  repairType?: string | null;
  heatingType?: string | null;
  wallType?: string | null;
  realEstateClass?: string | null;
  commercialPurpose?: string | null;
  parkingType?: string | null;
  parkingSpaces?: number | null;
  yearBuilt?: number | null;
  ceilingHeight?: number | null;
  managerComment?: string | null;
  internalDescription?: string | null;
  publicDescription?: string | null;
  description?: string | null;
  documents?: PropertyDocument[];
  mediaLinks?: PropertyMediaLink[];
  photos?: PropertyPhoto[];
  createdAt?: string;
  updatedAt?: string;
  priceHistory?: Array<{
    id: string;
    price: number;
    currency: string;
    createdAt: string;
    reason?: string | null;
  }>;
}

export interface PropertyUpsertInput {
  title: string;
  internalCode?: string;
  type?: string;
  source?: string;
  ownerName?: string;
  ownerPhone?: string;
  developerName?: string;
  developerContact?: string;
  status?: string;
  dealTypes?: string[];
  address?: string;
  district?: string;
  city?: string;
  rooms?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  area?: string | number;
  landArea?: string | number;
  floor?: string | number;
  totalFloors?: string | number;
  price?: string | number;
  currency?: string;
  paymentCondition?: string;
  communicationTypes?: string[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  publicationNotes?: string;
  publications?: PropertyPublicationInput[];
  layoutType?: string;
  repairType?: string;
  heatingType?: string;
  wallType?: string;
  realEstateClass?: string;
  commercialPurpose?: string;
  parkingType?: string;
  parkingSpaces?: string | number;
  yearBuilt?: string | number;
  ceilingHeight?: string | number;
  managerComment?: string;
  internalDescription?: string;
  publicDescription?: string;
  description?: string;
  documents?: PropertyDocumentInput[];
  mediaLinks?: PropertyMediaLinkInput[];
  photos?: PropertyPhotoInput[];
  priceHistoryReason?: string;
  priceHistoryNote?: string;
}

export interface PropertiesQuery {
  search?: string;
  type?: string;
  status?: string;
  dealType?: string;
  publicationChannel?: string;
  publicationStatus?: string;
}

export interface PropertyProfileDeal {
  id: string;
  title: string;
  stage?: string | null;
  amount?: number | null;
  currency?: string | null;
  dealType?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyProfileShowing {
  id: string;
  scheduledAt: string;
  status: string;
  durationMin?: number;
  createdAt?: string;
  lead?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  agent?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  deal?: {
    id: string;
    title?: string | null;
    stage?: string | null;
  } | null;
}

export interface PropertyProfileActivity {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface PropertyPriceStats {
  min: number;
  max: number;
  avg: number;
  current: number;
  currency: string;
  changesCount: number;
  daysOnMarket: number;
}

export interface PropertyProfileMetrics {
  dealsTotal: number;
  dealsWithAmount: number;
  dealsAmountSum: number;
  showingsTotal: number;
  showingsScheduled: number;
  showingsCompleted: number;
  showingsCancelled: number;
  showingsNoShow: number;
  showingsUpcoming: number;
}

export interface PropertyProfile extends Property {
  deals?: PropertyProfileDeal[];
  showings?: PropertyProfileShowing[];
  activity?: PropertyProfileActivity[];
  priceStats?: PropertyPriceStats | null;
  metrics?: PropertyProfileMetrics | null;
}
