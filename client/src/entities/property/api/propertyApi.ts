import { httpClient } from '@/shared/api';

export interface PropertyApiPayload {
  id: string;
  name: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

export const propertyApi = {
  getProperties: (query?: string) => httpClient.get<PropertyApiPayload[]>(`/properties${query ? `?${query}` : ''}`),
  getProperty: (id: string) => httpClient.get<PropertyApiPayload>(`/properties/${id}`),
  createProperty: (payload: Partial<PropertyApiPayload>) =>
    httpClient.post<PropertyApiPayload, Partial<PropertyApiPayload>>('/properties', payload),
  updateProperty: (id: string, payload: Partial<PropertyApiPayload>) =>
    httpClient.put<PropertyApiPayload, Partial<PropertyApiPayload>>(`/properties/${id}`, payload),
  deleteProperty: (id: string) => httpClient.delete<void>(`/properties/${id}`),
};
