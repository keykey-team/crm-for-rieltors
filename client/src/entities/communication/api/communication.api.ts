import type { Communication } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getLeadCommunications(leadId: string): Promise<Communication[]> {
  const res = await fetch(`/api/communications?leadId=${leadId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Communication[]) : [];
}

export async function createLeadCommunication(payload: { leadId: string; type: string; direction: string; content: string }): Promise<Communication> {
  const res = await fetch('/api/communications', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<Communication>(res);
}
