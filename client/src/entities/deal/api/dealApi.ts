import { httpClient } from '@/shared/api';

export interface DealApiPayload {
  id: string;
  title: string;
  stage: string;
  value?: number;
  [key: string]: unknown;
}

export const dealApi = {
  getDeals: () => httpClient.get<DealApiPayload[]>('/deals'),
  getDeal: (id: string) => httpClient.get<DealApiPayload>(`/deals/${id}`),
  createDeal: (payload: Partial<DealApiPayload>) => httpClient.post<DealApiPayload, Partial<DealApiPayload>>('/deals', payload),
  updateDeal: (id: string, payload: Partial<DealApiPayload>) =>
    httpClient.put<DealApiPayload, Partial<DealApiPayload>>(`/deals/${id}`, payload),
  deleteDeal: (id: string) => httpClient.delete<void>(`/deals/${id}`),
};
