export interface Deal {
  id: string;
  title: string;
  stage: string;
  amount?: number | null;
  commission?: number | null;
  currency?: string | null;
  notes?: string | null;
  leadId?: string | null;
  propertyId?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;
  lead?: { id: string; firstName?: string; lastName?: string; phone?: string } | null;
  property?: { id: string; title?: string; address?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealUpsertInput {
  title: string;
  stage?: string;
  amount?: string | number;
  commission?: string | number;
  currency?: string;
  notes?: string;
  leadId?: string | null;
  propertyId?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;
}
