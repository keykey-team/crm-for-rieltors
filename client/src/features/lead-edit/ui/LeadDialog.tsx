'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n/context';
import { getLeadFormDefaults, updateLeadForm } from '@/features/lead-edit/lib/form';
import { validateLeadForm } from '@/features/lead-edit/lib/validation';
import type { LeadDialogProps, LeadFormValues } from '@/features/lead-edit/model/types';
import { LeadDialogHeader } from './LeadDialogHeader';
import { LeadContactSection } from './LeadContactSection';
import { LeadMetaSection } from './LeadMetaSection';
import { LeadNeedSection } from './LeadNeedSection';
import { LeadNotesSection } from './LeadNotesSection';
import { LeadDialogActions } from './LeadDialogActions';

export function LeadDialog({ lead, onSave, onClose }: LeadDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<LeadFormValues>(() => getLeadFormDefaults(lead));
  const [saving, setSaving] = useState(false);

  const updateField = (key: keyof LeadFormValues, value: string) => {
    setForm((previousForm) => updateLeadForm(previousForm, key, value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateLeadForm(form)) {
      return;
    }

    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <LeadDialogHeader title={lead ? t('leads.dialog.editLead') : t('leads.dialog.newLead')} onClose={onClose} />

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <LeadContactSection form={form} onChange={updateField} t={t} />
          <LeadMetaSection form={form} onChange={updateField} t={t} />
          <LeadNeedSection form={form} onChange={updateField} t={t} />
          <LeadNotesSection form={form} onChange={updateField} t={t} />
          <LeadDialogActions saving={saving} onClose={onClose} t={t} />
        </form>
      </div>
    </div>
  );
}
