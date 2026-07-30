export type ShowingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | string;

export interface Showing {
  id: string;
  dealId?: string | null;
  propertyId: string;
  leadId?: string | null;
  agentId?: string | null;
  scheduledAt: string;
  durationMin: number;
  status: ShowingStatus;
  feedback?: string | null;
  clientRating?: number | null;
  agentNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deal?: { id: string; title?: string | null } | null;
  property?: { id: string; title?: string | null; address?: string | null } | null;
  lead?: { id: string; firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
  agent?: { id: string; name?: string | null; email?: string | null } | null;
}

export interface ShowingsListResponse {
  items: Showing[];
  total: number;
  page: number;
  limit: number;
}

export interface ShowingsQuery {
  dealId?: string;
  propertyId?: string;
  leadId?: string;
  agentId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateShowingInput {
  dealId?: string;
  propertyId: string;
  leadId?: string;
  agentId?: string;
  scheduledAt: string;
  durationMin?: number;
  status?: ShowingStatus;
  feedback?: string;
  clientRating?: number;
  agentNotes?: string;
  createEvent?: boolean;
}

export type UpdateShowingInput = Partial<CreateShowingInput>;
