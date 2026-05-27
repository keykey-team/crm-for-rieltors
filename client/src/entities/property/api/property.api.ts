import type { Property, PropertyUpsertInput, PropertiesQuery } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getProperties(query: PropertiesQuery = {}): Promise<Property[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.type) params.set('type', query.type);
  if (query.status) params.set('status', query.status);
  const suffix = params.toString();
  const res = await fetch(`/api/properties${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Property[]) : [];
}

export async function createProperty(payload: PropertyUpsertInput): Promise<Property> {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Property>(res);
}

export async function updateProperty(id: string, payload: Partial<PropertyUpsertInput>): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Property>(res);
}

export async function deleteProperty(id: string): Promise<void> {
  const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete property');
}
