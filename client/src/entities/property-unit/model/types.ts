export interface PropertyUnit {
  id: string;
  propertyId: string;
  floor: number;
  unitNumber: string;
  status: string;
  section?: number;
  rooms?: number | null;
  area?: number | null;
  price?: number | null;
  dealId?: string | null;
}
