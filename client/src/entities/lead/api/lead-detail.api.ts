import type { Lead } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getLeadById(id: string): Promise<Lead & { deals?: any[] }> {
  const res = await fetch(`/api/leads/${id}`);
  return parseJson<Lead & { deals?: any[] }>(res);
}

export async function createDealFromLead(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/leads/${id}/create-deal`, { method: 'POST' });
  return parseJson<{ id: string }>(res);
}
