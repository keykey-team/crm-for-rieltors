import { dealApi } from '@/entities/deal';

export async function deleteDeal(id: string) {
  await dealApi.deleteDeal(id);
}
