'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEAL_STAGES } from '@/shared/lib/constants';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import type { Lead } from '@/entities/lead';
import type { Property } from '@/entities/property';
import type { User as AppUser } from '@/entities/user';
import type { Funnel } from '@/entities/settings';
import { getUsers } from '@/entities/user';
import { createLead, getLeads } from '@/entities/lead';
import { createProperty, getProperties } from '@/entities/property';
import { getFunnels, getFunnelStages } from '@/entities/settings';
import { useFormDraft } from '@/shared/hooks/use-form-draft';
import {
  parseForm,
  dealSchema,
  propertySchema,
  normalizeEmailInput,
  normalizePhoneInput,
  validateLeadForm,
} from '@/shared/lib/validation';

export type DealStage = { value: string; label: string; color: string };

const CREATE_DEAL_DRAFT_KEY = 'crm_create_deal_draft';

function createEmptyForm(deal: Deal | null, preferredFunnelId?: string | null): DealUpsertInput {
  return {
    title: deal?.title ?? '',
    stage: deal?.stage ?? 'new_lead',
    funnelId: deal?.funnelId ?? preferredFunnelId ?? '',
    amount: deal?.amount?.toString() ?? '',
    commission: deal?.commission?.toString() ?? '',
    currency: deal?.currency ?? 'USD',
    notes: deal?.notes ?? '',
    leadId: deal?.leadId ?? '',
    propertyId: deal?.propertyId ?? '',
    assignedToId: deal?.assignedToId ?? '',
  };
}

export function useDealForm(deal: Deal | null, onSave: (d: DealUpsertInput) => void | Promise<void>, t: (key: string) => string, preferredFunnelId?: string | null) {
  const [stages, setStages] = useState<DealStage[]>(DEAL_STAGES as DealStage[]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const [leadOpen, setLeadOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [showNewPropForm, setShowNewPropForm] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [newPropForm, setNewPropForm] = useState({ title: '', address: '', price: '', dealTypes: ['sale'] as string[] });
  const [creatingLead, setCreatingLead] = useState(false);
  const [creatingProp, setCreatingProp] = useState(false);
  const [leadCreateError, setLeadCreateError] = useState('');
  const [propCreateError, setPropCreateError] = useState('');
  const [newLeadErrors, setNewLeadErrors] = useState<Record<string, string>>({});
  const [newPropErrors, setNewPropErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const createInitialValue = useCallback(() => createEmptyForm(deal, preferredFunnelId), [deal, preferredFunnelId]);
  const { form, setForm, clearDraft, resetForm: resetDraftForm } = useFormDraft<DealUpsertInput>({
    storageKey: CREATE_DEAL_DRAFT_KEY,
    createInitialValue,
    draftEnabled: !deal,
    resetKey: deal?.id ?? 'create',
  });

  useEffect(() => {
    getFunnels().then((items) => {
      setFunnels(items);
      if (!deal && !preferredFunnelId && !form.funnelId && items[0]?.id) {
        setForm((prev) => ({ ...prev, funnelId: items[0].id }));
      }
    }).catch(() => {});
    getLeads().then(setLeads).catch(() => {});
    getProperties().then(setProperties).catch(() => {});
    getUsers().then(setUsers).catch(() => {});
  }, [deal, preferredFunnelId, form.funnelId, setForm]);

  useEffect(() => {
    if (!form.funnelId) {
      setStages(DEAL_STAGES as DealStage[]);
      return;
    }

    getFunnelStages(form.funnelId).then((items) => {
      const nextStages = Array.isArray(items) && items.length > 0 ? (items as DealStage[]) : (DEAL_STAGES as DealStage[]);
      setStages(nextStages);
      setForm((prev) => {
        if (!prev.stage || !nextStages.some((stage) => stage.value === prev.stage)) {
          return { ...prev, stage: nextStages[0]?.value ?? prev.stage };
        }
        return prev;
      });
    }).catch(() => {});
  }, [form.funnelId, setForm]);

  useEffect(() => {
    setErrors({});
    setSubmitError('');
  }, [deal?.id]);

  const upd = <K extends keyof DealUpsertInput>(k: K, v: DealUpsertInput[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k as string]: '' }));
    setSubmitError('');
  };

  const updateNewLeadField = (key: 'firstName' | 'lastName' | 'phone' | 'email', value: string) => {
    const nextValue = key === 'phone' ? normalizePhoneInput(value) : key === 'email' ? normalizeEmailInput(value) : value;
    setNewLeadForm((prev) => ({ ...prev, [key]: nextValue }));
    setNewLeadErrors((prev) => ({ ...prev, [key]: '' }));
    setLeadCreateError('');
  };

  const updateNewPropField = (key: 'title' | 'address' | 'price' | 'dealTypes', value: string | string[]) => {
    setNewPropForm((prev) => ({ ...prev, [key]: value }));
    setNewPropErrors((prev) => ({ ...prev, [key]: '' }));
    setPropCreateError('');
  };

  const resetNewLeadFormState = () => {
    setShowNewLeadForm(false);
    setNewLeadForm({ firstName: '', lastName: '', phone: '', email: '' });
    setNewLeadErrors({});
    setLeadCreateError('');
  };

  const resetNewPropFormState = () => {
    setShowNewPropForm(false);
    setNewPropForm({ title: '', address: '', price: '', dealTypes: ['sale'] });
    setNewPropErrors({});
    setPropCreateError('');
  };

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

  const createLeadOption = async () => {
    const normalizedLead = {
      firstName: newLeadForm.firstName.trim(),
      lastName: newLeadForm.lastName.trim(),
      phone: normalizePhoneInput(newLeadForm.phone),
      email: normalizeEmailInput(newLeadForm.email),
    };
    const nextErrors = validateLeadForm(normalizedLead, t);
    if (Object.keys(nextErrors).length) {
      setNewLeadErrors(nextErrors);
      return;
    }

    setCreatingLead(true);
    setLeadCreateError('');
    setNewLeadErrors({});
    try {
      const lead = await createLead({
        firstName: normalizedLead.firstName,
        lastName: normalizedLead.lastName || undefined,
        phone: normalizedLead.phone,
        email: normalizedLead.email || undefined,
        source: 'manual',
      });
      setLeads((prev) => [lead, ...prev.filter((item) => item.id !== lead.id)]);
      setForm((prev) => ({ ...prev, leadId: lead.id }));
      setLeadSearch('');
      setLeadOpen(false);
      resetNewLeadFormState();
    } catch (error) {
      setLeadCreateError(error instanceof Error && error.message ? error.message : t('common.errorSave'));
    } finally {
      setCreatingLead(false);
    }
  };

  const createPropertyOption = async () => {
    const price = newPropForm.price.trim() ? Number(newPropForm.price) : undefined;
    const validation = parseForm(propertySchema, {
      title: newPropForm.title.trim(),
      address: newPropForm.address.trim(),
      price,
      dealTypes: newPropForm.dealTypes,
    });

    if (!validation.ok) {
      setNewPropErrors(validation.errors);
      return;
    }

    setCreatingProp(true);
    setPropCreateError('');
    setNewPropErrors({});
    try {
      const property = await createProperty({
        title: validation.data.title,
        address: validation.data.address,
        price: validation.data.price,
        dealTypes: validation.data.dealTypes,
      });
      setProperties((prev) => [property, ...prev.filter((item) => item.id !== property.id)]);
      setForm((prev) => ({ ...prev, propertyId: property.id }));
      setPropSearch('');
      setPropOpen(false);
      resetNewPropFormState();
    } catch (error) {
      setPropCreateError(error instanceof Error && error.message ? error.message : t('common.errorSave'));
    } finally {
      setCreatingProp(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toNum = (v: string | undefined) => (v ? Number(v) : undefined);
    const amountVal = toNum(form.amount as string | undefined);
    const commissionVal = toNum(form.commission as string | undefined);
    const validation = parseForm(dealSchema, {
      title: form.title,
      amount: Number.isNaN(amountVal) ? undefined : amountVal,
      commission: Number.isNaN(commissionVal) ? undefined : commissionVal,
      notes: form.notes || undefined,
    });
    if (!validation.ok) { setErrors(validation.errors); return; }
    setErrors({});
    setSaving(true);
    setSubmitError('');
    try {
      await onSave({
        ...form,
        funnelId: form.funnelId || null,
        leadId: form.leadId || null,
        propertyId: form.propertyId || null,
        assignedToId: form.assignedToId || null,
      });
      if (!deal) clearDraft();
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : t('common.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    resetDraftForm();
    setErrors({});
    setSubmitError('');
    setLeadSearch('');
    setPropSearch('');
    setLeadOpen(false);
    setPropOpen(false);
    resetNewLeadFormState();
    resetNewPropFormState();
  };

  return {
    stages,
    funnels,
    users,
    form,
    saving,
    errors,
    submitError,
    leadOpen,
    propOpen,
    showNewLeadForm,
    showNewPropForm,
    newLeadForm,
    newPropForm,
    creatingLead,
    creatingProp,
    leadCreateError,
    propCreateError,
    newLeadErrors,
    newPropErrors,
    leadSearch,
    propSearch,
    filteredLeads,
    filteredProps,
    selectedLead,
    selectedProp,
    setLeadOpen,
    setPropOpen,
    setShowNewLeadForm,
    setShowNewPropForm,
    setNewLeadForm,
    setNewPropForm,
    setLeadCreateError,
    setPropCreateError,
    setLeadSearch,
    setPropSearch,
    updateNewLeadField,
    updateNewPropField,
    resetNewLeadFormState,
    resetNewPropFormState,
    createLeadOption,
    createPropertyOption,
    resetForm,
    upd,
    submit,
  };
}
