'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Lead, LeadUpsertInput } from '@/entities/lead';
import type { User } from '@/entities/user';
import { getUsers } from '@/entities/user';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useFormDraft } from '@/shared/hooks/use-form-draft';
import {
  normalizeEmailInput,
  normalizePhoneInput,
  validateLeadForm,
} from '@/shared/lib/validation';

const CREATE_LEAD_DRAFT_KEY = 'crm_create_lead_draft';

function toDateInputValue(dateLike?: string | null) {
  if (!dateLike) return '';
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toIsoDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createEmptyForm(lead: Lead | null): LeadUpsertInput {
  return {
    firstName: lead?.firstName ?? '',
    lastName: lead?.lastName ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    source: lead?.source ?? 'manual',
    status: lead?.status ?? 'new_lead',
    needType: lead?.needType ?? 'buy',
    budget: lead?.budget?.toString() ?? '',
    priority: lead?.priority ?? 'medium',
    notes: lead?.notes ?? '',
    districts: lead?.districts ?? '',
    propertyType: lead?.propertyType ?? '',
    lastContact: toDateInputValue(lead?.lastContact),
    assignedToId: lead?.assignedToId ?? '',
  };
}

export function useLeadForm(lead: Lead | null, onSave: (data: LeadUpsertInput) => void | Promise<void>) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const createInitialValue = useCallback(() => createEmptyForm(lead), [lead]);
  const { form, setForm, clearDraft, resetForm: resetDraftForm } = useFormDraft<LeadUpsertInput>({
    storageKey: CREATE_LEAD_DRAFT_KEY,
    createInitialValue,
    draftEnabled: !lead,
    resetKey: lead?.id ?? 'create',
  });

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
  }, [lead?.id]);

  const upd = <K extends keyof LeadUpsertInput>(key: K, val: LeadUpsertInput[K]) => {
    let nextValue = val;

    if (key === 'phone') nextValue = normalizePhoneInput(String(val ?? '')) as LeadUpsertInput[K];
    if (key === 'email') nextValue = normalizeEmailInput(String(val ?? '')) as LeadUpsertInput[K];

    setForm((prev) => ({ ...prev, [key]: nextValue }));

    // After first failed submit: re-show the required error if phone is cleared again
    if (submitted && key === 'phone' && !String(nextValue)) {
      setErrors((prev) => ({ ...prev, phone: t('leads.form.validation.phoneRequired') }));
    } else {
      setErrors((prev) => ({ ...prev, [key as string]: '' }));
    }
    setSubmitError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const normalizedForm: LeadUpsertInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName?.trim() || undefined,
      email: normalizeEmailInput(form.email ?? '') || undefined,
      phone: normalizePhoneInput(form.phone ?? ''),
      source: form.source ?? 'manual',
      status: form.status ?? 'new_lead',
      needType: form.needType ?? 'buy',
      budget: String(form.budget ?? '').trim() || undefined,
      priority: form.priority ?? 'medium',
      notes: form.notes?.trim() || undefined,
      districts: form.districts?.trim() || undefined,
      propertyType: form.propertyType?.trim() || undefined,
      lastContact: toIsoDate(form.lastContact),
      assignedToId: form.assignedToId || '',
    };

    const nextErrors = validateLeadForm(normalizedForm, t);
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
    resetDraftForm();
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
  };

  return { users, saving, form, upd, submit, errors, submitError, resetForm };
}
