import type { Lead, LeadUpsertInput, LeadsQuery } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getLeads(query: LeadsQuery = {}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.source) params.set('source', query.source);
  if (query.managerId) params.set('managerId', query.managerId);
  const suffix = params.toString();
  const res = await fetch(`/api/leads${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Lead[]) : [];
}

export async function createLead(payload: LeadUpsertInput): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Lead>(res);
}

export async function updateLead(id: string, payload: Partial<LeadUpsertInput>): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Lead>(res);
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
