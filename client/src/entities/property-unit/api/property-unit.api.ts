import type { PropertyUnit } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getPropertyUnits(propertyId: string): Promise<PropertyUnit[]> {
  const res = await fetch(`/api/property-units?propertyId=${propertyId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as PropertyUnit[]) : [];
}

export async function createPropertyUnit(payload: Record<string, unknown>): Promise<PropertyUnit> {
  const res = await fetch('/api/property-units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<PropertyUnit>(res);
}

export async function updatePropertyUnit(id: string, data: Record<string, unknown>): Promise<PropertyUnit> {
  const res = await fetch('/api/property-units', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
  return parseJson<PropertyUnit>(res);
}

export async function deletePropertyUnit(id: string): Promise<void> {
  const res = await fetch(`/api/property-units?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete property unit');
}
