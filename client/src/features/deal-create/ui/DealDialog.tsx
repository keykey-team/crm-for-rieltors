'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n/context';
import { getDealFormDefaults, updateDealForm } from '@/features/deal-create/lib/form';
import { validateDealForm } from '@/features/deal-create/lib/validation';
import type { DealDialogProps, DealFormValues } from '@/features/deal-create/model/types';
import { DealDialogHeader } from './DealDialogHeader';
import { DealMainSection } from './DealMainSection';
import { DealFinanceSection } from './DealFinanceSection';
import { DealNotesSection } from './DealNotesSection';
import { DealDialogActions } from './DealDialogActions';

export function DealDialog({ deal, onSave, onClose }: DealDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<DealFormValues>(() => getDealFormDefaults(deal));
  const [saving, setSaving] = useState(false);

  const updateField = (key: keyof DealFormValues, value: string) => {
    setForm((previousForm) => updateDealForm(previousForm, key, value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateDealForm(form)) {
      return;
    }

    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <DealDialogHeader title={deal ? t('deals.dialog.editDeal') : t('deals.dialog.newDeal')} onClose={onClose} />

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <DealMainSection form={form} onChange={updateField} t={t} />
          <DealFinanceSection form={form} onChange={updateField} t={t} />
          <DealNotesSection form={form} onChange={updateField} t={t} />
          <DealDialogActions saving={saving} onClose={onClose} t={t} />
        </form>
      </div>
    </div>
  );
}
