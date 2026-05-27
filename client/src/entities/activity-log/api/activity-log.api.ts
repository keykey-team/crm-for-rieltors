import type { ActivityLogItem } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getActivityLog(entityType: string, entityId: string): Promise<ActivityLogItem[]> {
  const res = await fetch(`/api/activity-log?entityType=${entityType}&entityId=${entityId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ActivityLogItem[]) : [];
}


export async function listActivityLog(entityType?: string): Promise<ActivityLogItem[]> {
  const params = new URLSearchParams();
  if (entityType) params.set('entityType', entityType);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/activity-log${suffix}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ActivityLogItem[]) : [];
}
