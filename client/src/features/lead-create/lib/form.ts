import type { LeadFormValues } from '@/features/lead-create/model/types';

export function getLeadFormDefaults(lead: any): LeadFormValues {
  return {
    firstName: lead?.firstName ?? '',
    lastName: lead?.lastName ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    source: lead?.source ?? 'manual',
    status: lead?.status ?? 'new',
    needType: lead?.needType ?? 'buy',
    budget: lead?.budget?.toString() ?? '',
    priority: lead?.priority ?? 'medium',
    notes: lead?.notes ?? '',
    districts: lead?.districts ?? '',
    propertyType: lead?.propertyType ?? '',
  };
}

export function updateLeadForm(
  previousForm: LeadFormValues,
  key: keyof LeadFormValues,
  value: string,
): LeadFormValues {
  return { ...previousForm, [key]: value };
}
