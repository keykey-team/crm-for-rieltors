export type LeadStatus = string;
export type LeadSource = 'manual' | 'telegram' | 'instagram' | 'olx' | 'dom_ria' | 'website' | 'referral' | 'other' | string;

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone: string;
  source?: LeadSource | null;
  status?: LeadStatus | null;
  needType?: string | null;
  budget?: number | null;
  priority?: string | null;
  notes?: string | null;
  districts?: string | null;
  propertyType?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;
  lastContact?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadUpsertInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  source?: string;
  status?: string;
  needType?: string;
  budget?: string | number;
  priority?: string;
  notes?: string;
  districts?: string;
  propertyType?: string;
  lastContact?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;
}

export interface LeadsQuery {
  search?: string;
  status?: string;
  source?: string;
  managerId?: string;
}
