import type { Deal, DealUpsertInput } from '../model/types';

export interface DealListQuery {
  page?: number;
  limit?: number;
  funnelId?: string | null;
  stage?: string;
  managerId?: string;
  currency?: string;
  query?: string;
}

export interface DealListResponse {
  items: Deal[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

function matchesDealQuery(deal: Deal, params: DealListQuery) {
  if (params.funnelId && deal.funnelId !== params.funnelId) return false;
  if (params.stage && deal.stage !== params.stage) return false;
  if (params.managerId && deal.assignedToId !== params.managerId) return false;
  if (params.currency && (deal.currency ?? '') !== params.currency) return false;

  if (params.query) {
    const query = params.query.toLowerCase();
    const haystack = [
      deal.title,
      deal.lead?.firstName,
      deal.lead?.lastName,
      deal.lead?.phone,
      deal.property?.title,
      deal.property?.address,
      deal.assignedTo?.name,
      deal.assignedTo?.email,
    ].filter(Boolean).join(' ').toLowerCase();

    if (!haystack.includes(query)) return false;
  }

  return true;
}

function paginateDeals(items: Deal[], page = 1, limit = items.length || 1): DealListResponse {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.max(1, limit);
  const startIndex = (normalizedPage - 1) * normalizedLimit;
  const pagedItems = items.slice(startIndex, startIndex + normalizedLimit);

  return {
    items: pagedItems,
    total: items.length,
    page: normalizedPage,
    limit: normalizedLimit,
    hasMore: startIndex + normalizedLimit < items.length,
  };
}

function normalizeText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeId(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeDealPayload(payload: Partial<DealUpsertInput>): Partial<DealUpsertInput> {
  return {
    title: normalizeText(payload.title),
    stage: normalizeText(payload.stage),
    dealType: normalizeText(payload.dealType ?? undefined),
    funnelId: normalizeId(payload.funnelId),
    amount: normalizeNumber(payload.amount),
    commission: normalizeNumber(payload.commission),
    currency: normalizeText(payload.currency),
    notes: normalizeText(payload.notes),
    leadId: normalizeId(payload.leadId),
    propertyId: normalizeId(payload.propertyId),
    assignedToId: normalizeId(payload.assignedToId),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const fieldMessage =
      data && typeof data === 'object' && data.fields && typeof data.fields === 'object'
        ? Object.values(data.fields).find((value): value is string => typeof value === 'string' && value.length > 0)
        : undefined;
    throw new Error(fieldMessage || (data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function getDeals(params: DealListQuery = {}): Promise<DealListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const res = await fetch(`/api/deals${query ? `?${query}` : ''}`);
  const data = await parseJson<unknown>(res);

  if (data && typeof data === 'object' && 'items' in data) {
    return data as DealListResponse;
  }

  const items = Array.isArray(data) ? (data as Deal[]) : [];
  const filteredItems = items.filter((deal) => matchesDealQuery(deal, params));
  return paginateDeals(filteredItems, params.page, params.limit);
}

export async function createDeal(payload: DealUpsertInput): Promise<Deal> {
  const res = await fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizeDealPayload(payload)),
  });
  return parseJson<Deal>(res);
}

export async function updateDeal(id: string, payload: Partial<DealUpsertInput>): Promise<Deal & { _affectedCount?: number }> {
  const res = await fetch(`/api/deals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizeDealPayload(payload)),
  });
  return parseJson<Deal & { _affectedCount?: number }>(res);
}

export async function deleteDeal(id: string): Promise<void> {
  const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deal');
}
