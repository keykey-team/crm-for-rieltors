import { httpClient } from '@/shared/api';

export interface EventApiPayload {
  id: string;
  title: string;
  start: string;
  end: string;
  [key: string]: unknown;
}

export const eventApi = {
  getEvents: (query?: string) => httpClient.get<EventApiPayload[]>(`/events${query ? `?${query}` : ''}`),
  createEvent: (payload: Partial<EventApiPayload>) => httpClient.post<EventApiPayload, Partial<EventApiPayload>>('/events', payload),
  updateEvent: (id: string, payload: Partial<EventApiPayload>) =>
    httpClient.put<EventApiPayload, Partial<EventApiPayload>>(`/events/${id}`, payload),
  deleteEvent: (id: string) => httpClient.delete<void>(`/events/${id}`),
};
