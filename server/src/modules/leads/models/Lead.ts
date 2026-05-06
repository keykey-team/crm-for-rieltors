export interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string;
  source: string;
  status: string;
  needType: string;
  budget: number | null;
  budgetMax: number | null;
  districts: string | null;
  propertyType: string | null;
  notes: string | null;
  priority: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
