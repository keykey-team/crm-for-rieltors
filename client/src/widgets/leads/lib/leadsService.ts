import { leadApi } from '@/entities/lead';
import { httpClient } from '@/shared/api';
import type { LeadFilters } from '@/widgets/leads/model/types';

export async function getLeads(filters: LeadFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);

  const data = await leadApi.getLeads(params.toString());
  return Array.isArray(data) ? data : [];
}

export async function upsertLead(data: any, editingLeadId?: string) {
  if (editingLeadId) {
    return leadApi.updateLead(editingLeadId, data);
  }

  return leadApi.createLead(data);
}

export async function deleteLead(id: string) {
  return leadApi.deleteLead(id);
}

export async function updateLeadStatus(id: string, status: string) {
  return leadApi.updateLead(id, { status });
}

export async function importLeads(rows: any[]) {
  return httpClient.post<{ imported: number; errors?: string[] }, { leads: any[] }>('/leads/import', { leads: rows });
}
