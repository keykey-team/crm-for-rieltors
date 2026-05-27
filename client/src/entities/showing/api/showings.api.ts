import type {
  CreateShowingInput,
  Showing,
  ShowingsListResponse,
  ShowingsQuery,
  UpdateShowingInput,
} from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

function queryString(query: ShowingsQuery = {}) {
  const params = new URLSearchParams();
  if (query.dealId) params.set('dealId', query.dealId);
  if (query.propertyId) params.set('propertyId', query.propertyId);
  if (query.leadId) params.set('leadId', query.leadId);
  if (query.agentId) params.set('agentId', query.agentId);
  if (query.status) params.set('status', query.status);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const suffix = params.toString();
  return suffix ? `?${suffix}` : '';
}

export async function listShowings(query: ShowingsQuery = {}): Promise<ShowingsListResponse> {
  const res = await fetch(`/api/showings${queryString(query)}`);
  const data = await parseJson<ShowingsListResponse | Showing[]>(res);
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, limit: data.length };
  }
  return { items: data.items ?? [], total: data.total ?? 0, page: data.page ?? 1, limit: data.limit ?? 20 };
}

export async function getShowing(id: string): Promise<Showing> {
  const res = await fetch(`/api/showings/${id}`);
  return parseJson<Showing>(res);
}

export async function createShowing(payload: CreateShowingInput): Promise<Showing> {
  const res = await fetch('/api/showings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Showing>(res);
}

export async function updateShowing(id: string, payload: UpdateShowingInput): Promise<Showing> {
  const res = await fetch(`/api/showings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Showing>(res);
}

export async function deleteShowing(id: string): Promise<void> {
  const res = await fetch(`/api/showings/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete showing');
}

export async function getShowingDuplicates(propertyId: string, leadId: string): Promise<Showing[]> {
  const res = await fetch(`/api/showings/duplicates?propertyId=${propertyId}&leadId=${leadId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Showing[]) : [];
}
