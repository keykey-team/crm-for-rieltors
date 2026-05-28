import type { Lead } from '@/entities/lead';
import type { Property } from '@/entities/property';

export type ClientReaction = 'like' | 'dislike' | 'want_to_view';

export interface SelectionItem {
  id: string;
  selectionId: string;
  propertyId: string;
  order: number;
  agentComment?: string | null;
  clientReaction?: ClientReaction | null;
  clientNote?: string | null;
  reactedAt?: string | null;
  property: Property;
}

export interface ClientSelection {
  id: string;
  leadId: string;
  createdById: string;
  publicSlug: string;
  title?: string | null;
  message?: string | null;
  expiresAt?: string | null;
  viewsCount: number;
  lastViewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: Lead;
  items: SelectionItem[];
  createdBy?: { id: string; name?: string | null; brandLogo?: string | null; brandName?: string | null };
}
