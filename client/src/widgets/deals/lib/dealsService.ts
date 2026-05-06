export async function getDeals() {
  const response = await fetch('/api/deals');
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function saveDeal(data: any, editingDealId?: string) {
  if (editingDealId) {
    return fetch(`/api/deals/${editingDealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  return fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteDeal(id: string) {
  return fetch(`/api/deals/${id}`, { method: 'DELETE' });
}

export async function updateDealStage(id: string, stage: string) {
  return fetch(`/api/deals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
}
