import type { DealFormValues } from '@/features/deal-edit/model/types';

export function getDealFormDefaults(deal: any): DealFormValues {
  return {
    title: deal?.title ?? '',
    stage: deal?.stage ?? 'new_lead',
    amount: deal?.amount?.toString() ?? '',
    commission: deal?.commission?.toString() ?? '',
    notes: deal?.notes ?? '',
  };
}

export function updateDealForm(
  previousForm: DealFormValues,
  key: keyof DealFormValues,
  value: string,
): DealFormValues {
  return { ...previousForm, [key]: value };
}
