import type { Property, PropertyUpsertInput, PropertiesQuery } from '../model/types';

function normalizeText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePropertyPayload(payload: Partial<PropertyUpsertInput>): Partial<PropertyUpsertInput> {
  return {
    title: normalizeText(payload.title),
    type: normalizeText(payload.type),
    status: normalizeText(payload.status),
    address: normalizeText(payload.address),
    district: normalizeText(payload.district),
    city: normalizeText(payload.city),
    rooms: normalizeNumber(payload.rooms),
    area: normalizeNumber(payload.area),
    floor: normalizeNumber(payload.floor),
    totalFloors: normalizeNumber(payload.totalFloors),
    price: normalizeNumber(payload.price),
    currency: normalizeText(payload.currency),
    description: normalizeText(payload.description),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const fieldMessage =
      data && typeof data === 'object' && data.fields && typeof data.fields === 'object'
        ? Object.values(data.fields).find((value): value is string => typeof value === 'string' && value.length > 0)
        : undefined;
    throw new Error(fieldMessage || (data && (data.error || data.message)) || 'Request failed');
  }
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
    body: JSON.stringify(normalizePropertyPayload(payload)),
  });
  return parseJson<Property>(res);
}

export async function updateProperty(id: string, payload: Partial<PropertyUpsertInput>): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizePropertyPayload(payload)),
  });
  return parseJson<Property>(res);
}

export async function deleteProperty(id: string): Promise<void> {
  const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete property');
}
