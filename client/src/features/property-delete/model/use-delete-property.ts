import { propertyApi } from '@/entities/property';

export async function deletePropertie(id: string) {
  await propertyApi.deleteProperty(id);
}
