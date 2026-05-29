export interface PropertyPhoto {
  url: string;
  cloudStoragePath?: string;
}

export interface Property {
  id: string;
  title: string;
  type?: string | null;
  status?: string | null;
  dealTypes?: string[] | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  rooms?: number | null;
  area?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  price?: number | null;
  currency?: string | null;
  description?: string | null;
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
  type?: string;
  status?: string;
  dealTypes?: string[];
  address?: string;
  district?: string;
  city?: string;
  rooms?: string | number;
  area?: string | number;
  floor?: string | number;
  totalFloors?: string | number;
  price?: string | number;
  currency?: string;
  description?: string;
  priceHistoryReason?: string;
  priceHistoryNote?: string;
}

export interface PropertiesQuery {
  search?: string;
  type?: string;
  status?: string;
  dealType?: string;
}
