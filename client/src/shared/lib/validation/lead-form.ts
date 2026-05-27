export interface LeadValidationInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  budget?: string | number;
  notes?: string;
}

export function normalizePhoneInput(value: string): string {
  return value
    .replace(/[^+\d\s\-().]/g, '')
    .replace(/(?!^)\+/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 20)
    .trim();
}

export function normalizeEmailInput(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}

export function validateLeadForm(
  values: LeadValidationInput,
  t: (key: string) => string,
): Record<string, string> {
  const nextErrors: Record<string, string> = {};
  const firstName = values.firstName?.trim() ?? '';
  const lastName = values.lastName?.trim() ?? '';
  const phone = normalizePhoneInput(values.phone ?? '');
  const email = normalizeEmailInput(values.email ?? '');
  const budgetValue = String(values.budget ?? '').trim();
  const notes = values.notes?.trim() ?? '';

  if (!firstName) nextErrors.firstName = t('leads.form.validation.firstNameRequired');
  else if (firstName.length > 100) nextErrors.firstName = t('leads.form.validation.firstNameTooLong');

  if (lastName.length > 100) nextErrors.lastName = t('leads.form.validation.lastNameTooLong');

  if (!phone) nextErrors.phone = t('leads.form.validation.phoneRequired');
  else if (phone.length > 20) nextErrors.phone = t('leads.form.validation.phoneTooLong');
  else if (!/^[+\d\s\-().]{1,20}$/.test(phone)) nextErrors.phone = t('leads.form.validation.phoneInvalid');

  if (email.length > 254) nextErrors.email = t('leads.form.validation.emailTooLong');
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t('leads.form.validation.emailInvalid');

  if (budgetValue) {
    const parsedBudget = Number(budgetValue);
    if (!Number.isFinite(parsedBudget)) nextErrors.budget = t('leads.form.validation.budgetInvalid');
    else if (parsedBudget < 0) nextErrors.budget = t('leads.form.validation.budgetNegative');
  }

  if (notes.length > 2000) nextErrors.notes = t('leads.form.validation.notesTooLong');

  return nextErrors;
}