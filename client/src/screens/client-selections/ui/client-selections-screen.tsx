'use client';

import { useState } from 'react';
import { SelectionCard, useSelections } from '@/entities/client-selection';
import { useTranslation } from '@/shared/lib/i18n/context';

export function ClientSelectionsScreen() {
  const { t } = useTranslation();
  const [leadId, setLeadId] = useState('');
  const { items, loading } = useSelections(leadId || undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('selections.title')}</h1>
        <input value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder={t('selections.filterLead')} className="px-3 py-2 border border-border rounded-lg bg-card text-sm" />
      </div>
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : items.map((item) => <SelectionCard key={item.id} selection={item} />)}
    </div>
  );
}
