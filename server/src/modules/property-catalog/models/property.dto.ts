export interface PropertyQuery {
  search?: string;
  status?: string;
  type?: string;
}

export interface PropertyPayload {
  rooms?: unknown;
  area?: unknown;
  floor?: unknown;
  totalFloors?: unknown;
  price?: unknown;
  district?: unknown;
  description?: unknown;
  [key: string]: unknown;
}

