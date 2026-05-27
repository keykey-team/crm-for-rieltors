import type { Deal, DealUpsertInput } from '../model/types';

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

export async function getDeals(): Promise<Deal[]> {
  const res = await fetch('/api/deals');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Deal[]) : [];
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
