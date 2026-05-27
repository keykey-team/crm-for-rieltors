'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type { FunnelStage } from '@/entities/settings';
import type { User } from '@/entities/user';

type DealFilters = {
  query: string;
  stage: string;
  managerId: string;
  currency: string;
};

interface Props {
  filters: DealFilters;
  stages: FunnelStage[];
  managers: User[];
  onApply: (filters: DealFilters) => void;
  onClose: () => void;
  t: (key: string) => string;
}

export function DealsFilterDialog({ filters, stages, managers, onApply, onClose, t }: Props) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleClear = () => {
    setDraft({ query: '', stage: '', managerId: '', currency: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h2 className="font-display font-bold text-lg">{t('deals.filtersTitle')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('deals.filtersSubtitle')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('common.search')}</label>
            <input
              value={draft.query}
              onChange={(event) => setDraft((prev) => ({ ...prev, query: event.target.value }))}
              placeholder={t('deals.searchPlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.stage')}</label>
              <select value={draft.stage} onChange={(event) => setDraft((prev) => ({ ...prev, stage: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('settings.all')}</option>
                {stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('common.manager')}</label>
              <select value={draft.managerId} onChange={(event) => setDraft((prev) => ({ ...prev, managerId: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('settings.all')}</option>
                {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.currency')}</label>
              <select value={draft.currency} onChange={(event) => setDraft((prev) => ({ ...prev, currency: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('settings.all')}</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="UAH">UAH</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3">
          <button onClick={handleClear} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">{t('deals.clearFilters')}</button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">{t('common.cancel')}</button>
            <button onClick={() => onApply(draft)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">{t('deals.applyFilters')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}