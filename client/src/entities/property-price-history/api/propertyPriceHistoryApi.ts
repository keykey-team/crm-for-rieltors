import type { PricePointInput, PriceStats, PropertyPriceHistoryResponse } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getPropertyPriceHistory(propertyId: string, params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => value != null && query.set(key, String(value)));
  const suffix = query.toString();
  const res = await fetch(`/api/properties/${propertyId}/price-history${suffix ? `?${suffix}` : ''}`);
  return parseJson<PropertyPriceHistoryResponse>(res);
}

export async function getPropertyPriceStats(propertyId: string) {
  const res = await fetch(`/api/properties/${propertyId}/price-stats`);
  return parseJson<PriceStats>(res);
}

export async function addPropertyPricePoint(propertyId: string, payload: PricePointInput) {
  const res = await fetch(`/api/properties/${propertyId}/price-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}
