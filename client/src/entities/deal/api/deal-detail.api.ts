async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getDealById(dealId: string) {
  const res = await fetch(`/api/deals/${dealId}`);
  return parseJson<any>(res);
}

export async function updateDealById(dealId: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/deals/${dealId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function getDealComments(dealId: string) {
  const res = await fetch(`/api/deals/${dealId}/comments`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? data : [];
}

export async function createDealComment(dealId: string, text: string) {
  const res = await fetch(`/api/deals/${dealId}/comments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
  });
  return parseJson<any>(res);
}

export async function getDealChecklist(dealId: string) {
  const res = await fetch(`/api/deals/${dealId}/checklist`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? data : [];
}

export async function createDealChecklistItem(dealId: string, title: string, order: number) {
  const res = await fetch(`/api/deals/${dealId}/checklist`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, order }),
  });
  return parseJson<any>(res);
}

export async function updateDealChecklistItem(dealId: string, itemId: string, completed: boolean) {
  const res = await fetch(`/api/deals/${dealId}/checklist`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, completed }),
  });
  return parseJson<any>(res);
}

export async function deleteDealChecklistItem(dealId: string, itemId: string) {
  const res = await fetch(`/api/deals/${dealId}/checklist/${itemId}`, { method: 'DELETE' });
  return parseJson<any>(res);
}

export async function getDealCustomFieldValues(dealId: string) {
  const res = await fetch(`/api/deals/custom-field-values?dealId=${dealId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? data : [];
}

export async function upsertDealCustomFieldValue(dealId: string, fieldId: string, value: string) {
  const res = await fetch('/api/deals/custom-field-values', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId, fieldId, value }),
  });
  return parseJson<any>(res);
}