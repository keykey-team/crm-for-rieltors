export interface PropertyPricePoint {
  id: string;
  propertyId?: string;
  price: number;
  currency: string;
  reason?: string | null;
  note?: string | null;
  createdAt: string;
  user?: { id: string; name?: string | null; email?: string | null } | null;
}

export interface PropertyPriceHistoryResponse {
  items: PropertyPricePoint[];
  total: number;
  page: number;
  limit: number;
}

export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  current: number;
  currency: string;
  changesCount: number;
  daysOnMarket: number;
}

export interface PricePointInput {
  price: number;
  currency?: string;
  reason?: string;
  note?: string;
  createdAt?: string;
}
