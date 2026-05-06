import { dealApi } from '@/entities/deal';

export async function getDeals() {
  const data = await dealApi.getDeals();
  return Array.isArray(data) ? data : [];
}

export async function saveDeal(data: any, editingDealId?: string) {
  if (editingDealId) {
    return dealApi.updateDeal(editingDealId, data);
  }

  return dealApi.createDeal(data);
}

export async function deleteDeal(id: string) {
  return dealApi.deleteDeal(id);
}

export async function updateDealStage(id: string, stage: string) {
  return dealApi.updateDeal(id, { stage });
}
