import type { Automation, AutomationUpsertInput } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getAutomations(): Promise<Automation[]> {
  const res = await fetch('/api/automations');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Automation[]) : [];
}

export async function createAutomation(payload: AutomationUpsertInput): Promise<Automation> {
  const res = await fetch('/api/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Automation>(res);
}

export async function updateAutomation(id: string, payload: Partial<AutomationUpsertInput> & { isActive?: boolean }): Promise<Automation> {
  const res = await fetch(`/api/automations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Automation>(res);
}

export async function deleteAutomation(id: string): Promise<void> {
  const res = await fetch(`/api/automations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete automation');
}
