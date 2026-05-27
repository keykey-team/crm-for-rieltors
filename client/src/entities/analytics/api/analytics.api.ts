import type { AnalyticsExtended } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getAnalyticsExtended(from?: string, to?: string): Promise<AnalyticsExtended> {
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`/api/analytics/extended${suffix}`);
  return parseJson<AnalyticsExtended>(res);
}
