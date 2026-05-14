export interface PropertyPhoto {
  url: string;
}

export interface Property {
  id: string;
  title: string;
  type?: string | null;
  status?: string | null;
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
}

export interface PropertyUpsertInput {
  title: string;
  type?: string;
  status?: string;
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
}

export interface PropertiesQuery {
  search?: string;
  type?: string;
  status?: string;
}
