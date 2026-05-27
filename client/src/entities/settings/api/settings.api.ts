import type {
  AftercarePlan,
  BrandSettings,
  DealCustomField,
  DictionaryItem,
  DistributionRule,
  Funnel,
  FunnelStage,
  ProfileSettings,
  TeamUser,
} from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getProfileSettings(): Promise<ProfileSettings> {
  const res = await fetch('/api/settings/profile');
  return parseJson<ProfileSettings>(res);
}

export async function updateProfileSettings(payload: Record<string, unknown>): Promise<ProfileSettings> {
  const res = await fetch('/api/settings/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<ProfileSettings>(res);
}

export async function updateBrandSettings(payload: Record<string, unknown>): Promise<BrandSettings> {
  const res = await fetch('/api/settings/brand', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<BrandSettings>(res);
}

export async function getTeamUsers(): Promise<TeamUser[]> {
  const res = await fetch('/api/users');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as TeamUser[]) : [];
}

export async function deleteTeamUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function getFunnels(): Promise<Funnel[]> {
  const res = await fetch('/api/funnels');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Funnel[]) : [];
}

export async function createFunnel(payload: { name: string }): Promise<Funnel> {
  const res = await fetch('/api/funnels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<Funnel>(res);
}

export async function updateFunnel(id: string, payload: { name: string }): Promise<Funnel> {
  const res = await fetch(`/api/funnels/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<Funnel>(res);
}

export async function deleteFunnel(id: string): Promise<void> {
  const res = await fetch(`/api/funnels/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete funnel');
}

export async function getFunnelStages(funnelId?: string): Promise<FunnelStage[]> {
  const url = funnelId ? `/api/funnel-stages?funnelId=${funnelId}` : '/api/funnel-stages';
  const res = await fetch(url);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as FunnelStage[]) : [];
}

export async function createFunnelStage(payload: Record<string, unknown>): Promise<FunnelStage> {
  const res = await fetch('/api/funnel-stages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<FunnelStage>(res);
}

export async function reorderFunnelStages(items: Array<{ id: string; order: number }>) {
  await updateFunnelStage({ stages: items });
}

export async function updateFunnelStage(payload: Record<string, unknown>): Promise<FunnelStage> {
  const res = await fetch('/api/funnel-stages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<FunnelStage>(res);
}

export async function deleteFunnelStage(id: string): Promise<void> {
  const res = await fetch(`/api/funnel-stages?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete funnel stage');
}

export async function getDealCustomFields(): Promise<DealCustomField[]> {
  const res = await fetch('/api/deal-custom-fields');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as DealCustomField[]) : [];
}

export async function createDealCustomField(payload: Record<string, unknown>): Promise<DealCustomField> {
  const res = await fetch('/api/deal-custom-fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<DealCustomField>(res);
}

export async function deleteDealCustomField(id: string): Promise<void> {
  const res = await fetch(`/api/deal-custom-fields?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete custom field');
}

export async function getDictionaries(category: string): Promise<DictionaryItem[]> {
  const res = await fetch(`/api/dictionaries?category=${category}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as DictionaryItem[]) : [];
}

export async function createDictionary(payload: Record<string, unknown>): Promise<DictionaryItem> {
  const res = await fetch('/api/dictionaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return parseJson<DictionaryItem>(res);
}

export async function deleteDictionary(id: string): Promise<void> {
  const res = await fetch(`/api/dictionaries?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete dictionary item');
}

export async function getDistributionRules(): Promise<DistributionRule[]> {
  const res = await fetch('/api/lead-distribution');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as DistributionRule[]) : [];
}

export async function upsertDistributionRule(payload: Record<string, unknown>, editing: boolean): Promise<DistributionRule> {
  const res = await fetch('/api/lead-distribution', {
    method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<DistributionRule>(res);
}

export async function deleteDistributionRule(id: string): Promise<void> {
  const res = await fetch(`/api/lead-distribution?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete distribution rule');
}

export async function getAftercarePlans(): Promise<AftercarePlan[]> {
  const res = await fetch('/api/aftercare-plans');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as AftercarePlan[]) : [];
}

export async function upsertAftercarePlan(payload: Record<string, unknown>, id?: string): Promise<AftercarePlan> {
  const res = await fetch(id ? `/api/aftercare-plans/${id}` : '/api/aftercare-plans', {
    method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<AftercarePlan>(res);
}

export async function deleteAftercarePlan(id: string): Promise<void> {
  const res = await fetch(`/api/aftercare-plans/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete aftercare plan');
}


export async function getUploadPresigned(payload: Record<string, unknown>) {
  const res = await fetch('/api/upload/presigned', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function reorderCustomFields(items: Array<{ id: string; order: number }>) {
  const res = await fetch('/api/deal-custom-fields', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to reorder custom fields');
}

export async function reorderDictionaries(items: Array<{ id: string; order: number }>) {
  const res = await fetch('/api/dictionaries', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to reorder dictionaries');
}

export async function reorderDistributionRules(items: Array<{ id: string; priority: number }>) {
  const res = await fetch('/api/lead-distribution', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to reorder distribution rules');
}

export async function reorderAftercarePlans(items: Array<{ id: string; order: number }>) {
  const res = await fetch('/api/aftercare-plans', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to reorder aftercare plans');
}

export async function updateUserPermissions(userId: string, permissions: string | null) {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions }),
  });
  return parseJson<any>(res);
}
