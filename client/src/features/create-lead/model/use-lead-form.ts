'use client';

import { useEffect, useState } from 'react';

import type { Lead, LeadUpsertInput } from '@/entities/lead';
import type { User } from '@/entities/user';
import { getUsers } from '@/entities/user';
import { useTranslation } from '@/shared/lib/i18n/context';

const CREATE_LEAD_DRAFT_KEY = 'crm_create_lead_draft';

function createEmptyForm(lead: Lead | null): LeadUpsertInput {
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
    assignedToId: lead?.assignedToId ?? '',
  };
}

function normalizePhoneInput(value: string): string {
  return value
    .replace(/[^+\d\s\-().]/g, '')
    .replace(/(?!^)\+/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 20)
    .trim();
}

function normalizeEmailInput(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}

function readDraft(): LeadUpsertInput | null {
  try {
    const raw = localStorage.getItem(CREATE_LEAD_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LeadUpsertInput;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(CREATE_LEAD_DRAFT_KEY);
  } catch {}
}

export function useLeadForm(lead: Lead | null, onSave: (data: LeadUpsertInput) => void | Promise<void>) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const [form, setForm] = useState<LeadUpsertInput>(() => createEmptyForm(lead));

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (lead) {
      setForm(createEmptyForm(lead));
      setErrors({});
      setSubmitError('');
      setDraftReady(true);
      return;
    }

    setForm(readDraft() ?? createEmptyForm(null));
    setErrors({});
    setSubmitError('');
    setDraftReady(true);
  }, [lead]);

  useEffect(() => {
    if (lead || !draftReady) return;

    try {
      localStorage.setItem(CREATE_LEAD_DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form, lead, draftReady]);

  const validateForm = (values: LeadUpsertInput) => {
    const nextErrors: Record<string, string> = {};
    const firstName = values.firstName.trim();
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
  };

  const upd = <K extends keyof LeadUpsertInput>(key: K, val: LeadUpsertInput[K]) => {
    let nextValue = val;

    if (key === 'phone') nextValue = normalizePhoneInput(String(val ?? '')) as LeadUpsertInput[K];
    if (key === 'email') nextValue = normalizeEmailInput(String(val ?? '')) as LeadUpsertInput[K];

    setForm((prev) => ({ ...prev, [key]: nextValue }));
    setErrors((prev) => ({ ...prev, [key as string]: '' }));
    setSubmitError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedForm: LeadUpsertInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName?.trim() || undefined,
      email: normalizeEmailInput(form.email ?? '') || undefined,
      phone: normalizePhoneInput(form.phone ?? ''),
      source: form.source ?? 'manual',
      status: form.status ?? 'new',
      needType: form.needType ?? 'buy',
      budget: String(form.budget ?? '').trim() || undefined,
      priority: form.priority ?? 'medium',
      notes: form.notes?.trim() || undefined,
      districts: form.districts?.trim() || undefined,
      propertyType: form.propertyType?.trim() || undefined,
      assignedToId: form.assignedToId || '',
    };

    const nextErrors = validateForm(normalizedForm);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setSaving(true);

    try {
      await onSave(normalizedForm);
      if (!lead) clearDraft();
    } catch (error) {
      const message = error instanceof Error ? error.message.trim() : '';
      setSubmitError(message && message !== 'Request failed' ? message : t('leads.form.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    clearDraft();
    setForm(createEmptyForm(lead));
    setErrors({});
    setSubmitError('');
  };

  return { users, saving, form, upd, submit, errors, submitError, resetForm };
}
