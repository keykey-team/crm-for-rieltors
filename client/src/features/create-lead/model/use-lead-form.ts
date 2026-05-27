'use client';

import { useEffect, useState } from 'react';

import type { Lead, LeadUpsertInput } from '@/entities/lead';
import type { User } from '@/entities/user';
import { getUsers } from '@/entities/user';

export function useLeadForm(lead: Lead | null, onSave: (data: LeadUpsertInput) => void | Promise<void>) {
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LeadUpsertInput>({
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
  });

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const upd = <K extends keyof LeadUpsertInput>(key: K, val: LeadUpsertInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return { users, saving, form, upd, submit };
}
