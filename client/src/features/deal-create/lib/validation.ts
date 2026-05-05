import type { DealFormValues } from '@/features/deal-create/model/types';

export function validateDealForm(form: DealFormValues): boolean {
  return form.title.trim().length > 0;
}
