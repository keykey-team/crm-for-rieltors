import type { CalendarEvent, CalendarEventUpsertInput, CalendarTokenResponse } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getEventsByMonth(month: number, year: number): Promise<CalendarEvent[]> {
  const res = await fetch(`/api/events?month=${month}&year=${year}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as CalendarEvent[]) : [];
}

export async function createEvent(payload: CalendarEventUpsertInput): Promise<CalendarEvent> {
  const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<CalendarEvent>(res);
}

export async function updateEvent(id: string, payload: CalendarEventUpsertInput): Promise<CalendarEvent> {
  const res = await fetch(`/api/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<CalendarEvent>(res);
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete event');
}

export async function getCalendarToken(): Promise<CalendarTokenResponse> {
  const res = await fetch('/api/calendar/token');
  return parseJson<CalendarTokenResponse>(res);
}

export async function createCalendarToken(): Promise<CalendarTokenResponse> {
  const res = await fetch('/api/calendar/token', { method: 'POST' });
  return parseJson<CalendarTokenResponse>(res);
}

export async function revokeCalendarToken(): Promise<void> {
  const res = await fetch('/api/calendar/token', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to revoke token');
}
