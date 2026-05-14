import type { DashboardStats } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  return parseJson<DashboardStats>(res);
}
