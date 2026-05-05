import type { LeadFormValues } from '@/features/lead-edit/model/types';

export function validateLeadForm(form: LeadFormValues): boolean {
  return form.firstName.trim().length > 0 && form.phone.trim().length > 0;
}
