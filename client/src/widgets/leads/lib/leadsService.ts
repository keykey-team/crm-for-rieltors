import type { LeadFilters } from '@/widgets/leads/model/types';

export async function getLeads(filters: LeadFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);

  const response = await fetch(`/api/leads?${params}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function upsertLead(data: any, editingLeadId?: string) {
  const url = editingLeadId ? `/api/leads/${editingLeadId}` : '/api/leads';
  const method = editingLeadId ? 'PUT' : 'POST';

  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string) {
  return fetch(`/api/leads/${id}`, { method: 'DELETE' });
}

export async function updateLeadStatus(id: string, status: string) {
  return fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function importLeads(rows: any[]) {
  const response = await fetch('/api/leads/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads: rows }),
  });

  return response.json();
}
