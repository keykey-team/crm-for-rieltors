'use client';

import { useEffect, useMemo, useState } from 'react';

import { DEAL_STAGES } from '@/shared/lib/constants';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import type { Lead } from '@/entities/lead';
import type { Property } from '@/entities/property';
import type { User as AppUser } from '@/entities/user';
import { getUsers } from '@/entities/user';
import { getLeads } from '@/entities/lead';
import { getProperties } from '@/entities/property';
import { getFunnelStages } from '@/entities/settings';

export type DealStage = { value: string; label: string; color: string };

export function useDealForm(deal: Deal | null, onSave: (d: DealUpsertInput) => void | Promise<void>) {
  const [stages, setStages] = useState<DealStage[]>(DEAL_STAGES as DealStage[]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const [leadOpen, setLeadOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<DealUpsertInput>({
    title: deal?.title ?? '',
    stage: deal?.stage ?? 'new_lead',
    amount: deal?.amount?.toString() ?? '',
    commission: deal?.commission?.toString() ?? '',
    currency: deal?.currency ?? 'USD',
    notes: deal?.notes ?? '',
    leadId: deal?.leadId ?? '',
    propertyId: deal?.propertyId ?? '',
    assignedToId: deal?.assignedToId ?? '',
  });

  useEffect(() => {
    getFunnelStages().then((d) => { if (Array.isArray(d) && d.length > 0) setStages(d as DealStage[]); }).catch(() => {});
    getLeads().then(setLeads).catch(() => {});
    getProperties().then(setProperties).catch(() => {});
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const upd = <K extends keyof DealUpsertInput>(k: K, v: DealUpsertInput[K]) => setForm((p) => ({ ...p, [k]: v }));

  const filteredLeads = useMemo(() => {
    if (!leadSearch.trim()) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter((l) => `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) || (l.phone ?? '').includes(q) || (l.email ?? '').toLowerCase().includes(q));
  }, [leads, leadSearch]);

  const filteredProps = useMemo(() => {
    if (!propSearch.trim()) return properties;
    const q = propSearch.toLowerCase();
    return properties.filter((p) => (p.title ?? '').toLowerCase().includes(q) || (p.address ?? '').toLowerCase().includes(q));
  }, [properties, propSearch]);

  const selectedLead = leads.find((l) => l.id === form.leadId);
  const selectedProp = properties.find((p) => p.id === form.propertyId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, leadId: form.leadId || null, propertyId: form.propertyId || null, assignedToId: form.assignedToId || null });
    setSaving(false);
  };

  return {
    stages,
    users,
    form,
    saving,
    leadOpen,
    propOpen,
    leadSearch,
    propSearch,
    filteredLeads,
    filteredProps,
    selectedLead,
    selectedProp,
    setLeadOpen,
    setPropOpen,
    setLeadSearch,
    setPropSearch,
    upd,
    submit,
  };
}
