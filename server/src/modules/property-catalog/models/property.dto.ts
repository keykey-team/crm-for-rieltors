export interface PropertyQuery {
  search?: string;
  status?: string;
  type?: string;
  dealType?: string;
}

export interface PropertyPayload {
  rooms?: unknown;
  area?: unknown;
  floor?: unknown;
  totalFloors?: unknown;
  price?: unknown;
  district?: unknown;
  description?: unknown;
  dealTypes?: unknown;
  priceHistoryReason?: unknown;
  priceHistoryNote?: unknown;
  [key: string]: unknown;
}
