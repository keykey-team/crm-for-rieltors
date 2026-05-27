import type { Lead, LeadUpsertInput, LeadsQuery } from '../model/types';
import { normalizeStageValue } from '@/shared/lib/funnel-stages';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

function normalizeLeadStatus<T extends { status?: string | null }>(lead: T): T {
  if (!lead || typeof lead !== 'object') return lead;
  return {
    ...lead,
    status: normalizeStageValue(lead.status) || lead.status,
  };
}

function normalizeLeadPayload<T extends { status?: string | null }>(payload: T): T {
  if (!payload || typeof payload !== 'object' || payload.status === undefined) return payload;
  return {
    ...payload,
    status: normalizeStageValue(payload.status) || payload.status,
  };
}

export async function getLeads(query: LeadsQuery = {}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', normalizeStageValue(query.status) || query.status);
  if (query.source) params.set('source', query.source);
  if (query.managerId) params.set('managerId', query.managerId);
  const suffix = params.toString();
  const res = await fetch(`/api/leads${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Lead[]).map((lead) => normalizeLeadStatus(lead)) : [];
}

export async function createLead(payload: LeadUpsertInput): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizeLeadPayload(payload)),
  });
  return normalizeLeadStatus(await parseJson<Lead>(res));
}

export async function updateLead(id: string, payload: Partial<LeadUpsertInput>): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizeLeadPayload(payload)),
  });
  return normalizeLeadStatus(await parseJson<Lead>(res));
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete lead');
}


export async function bulkLeadsAction(payload: { ids: string[]; action: string; value?: string }) {
  const res = await fetch('/api/leads/bulk', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function importLeads(rows: any[]) {
  const res = await fetch('/api/leads/import', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leads: rows }),
  });
  return parseJson<any>(res);
}
