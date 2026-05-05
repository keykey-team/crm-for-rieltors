import { leadApi } from '@/entities/lead';

export async function deleteLead(id: string) {
  await leadApi.deleteLead(id);
}
