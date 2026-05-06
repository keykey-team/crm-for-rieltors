import { httpClient } from '@/shared/api';

export interface LeadApiPayload {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: string;
  [key: string]: unknown;
}

export const leadApi = {
  getLeads: (query?: string) => httpClient.get<LeadApiPayload[]>(`/leads${query ? `?${query}` : ''}`),
  getLead: (id: string) => httpClient.get<LeadApiPayload>(`/leads/${id}`),
  createLead: (payload: Partial<LeadApiPayload>) => httpClient.post<LeadApiPayload, Partial<LeadApiPayload>>('/leads', payload),
  updateLead: (id: string, payload: Partial<LeadApiPayload>) =>
    httpClient.put<LeadApiPayload, Partial<LeadApiPayload>>(`/leads/${id}`, payload),
  deleteLead: (id: string) => httpClient.delete<void>(`/leads/${id}`),
};
