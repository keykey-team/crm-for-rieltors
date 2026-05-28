import type { ClientReaction, ClientSelection } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getSelections(leadId?: string): Promise<ClientSelection[]> {
  const params = new URLSearchParams();
  if (leadId) params.set('leadId', leadId);
  const suffix = params.toString();
  const res = await fetch(`/api/selections${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ClientSelection[]) : [];
}

export async function getLeadMatches(leadId: string, limit = 10) {
  const res = await fetch(`/api/leads/${leadId}/matches?limit=${limit}`);
  return parseJson<any[]>(res);
}

export async function createSelection(payload: {
  leadId: string;
  propertyIds: string[];
  title?: string;
  message?: string;
  expiresAt?: string;
}): Promise<ClientSelection> {
  const res = await fetch('/api/selections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<ClientSelection>(res);
}

export async function updateSelection(id: string, payload: Partial<{ title: string; message: string; expiresAt: string | null }>) {
  const res = await fetch(`/api/selections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<ClientSelection>(res);
}

export async function removeSelection(id: string) {
  const res = await fetch(`/api/selections/${id}`, { method: 'DELETE' });
  return parseJson<{ ok: boolean }>(res);
}

export async function reorderSelectionItems(id: string, items: Array<{ itemId: string; order: number }>) {
  const res = await fetch(`/api/selections/${id}/items/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return parseJson<ClientSelection>(res);
}

export async function updateSelectionItemComment(id: string, itemId: string, agentComment: string) {
  const res = await fetch(`/api/selections/${id}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentComment }),
  });
  return parseJson<ClientSelection>(res);
}

export async function getPublicSelection(slug: string) {
  const res = await fetch(`/api/public/selections/${slug}`, { cache: 'no-store' });
  return parseJson<ClientSelection>(res);
}

export async function recordSelectionReaction(slug: string, itemId: string, reaction: ClientReaction, clientNote?: string) {
  const res = await fetch(`/api/public/selections/${slug}/items/${itemId}/reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction, clientNote }),
  });
  return parseJson<ClientSelection>(res);
}
