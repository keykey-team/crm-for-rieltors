import type { Deal, DealUpsertInput } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getDeals(): Promise<Deal[]> {
  const res = await fetch('/api/deals');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Deal[]) : [];
}

export async function createDeal(payload: DealUpsertInput): Promise<Deal> {
  const res = await fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Deal>(res);
}

export async function updateDeal(id: string, payload: Partial<DealUpsertInput>): Promise<Deal> {
  const res = await fetch(`/api/deals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Deal>(res);
}

export async function deleteDeal(id: string): Promise<void> {
  const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deal');
}
