'use client';

import { Plus, Workflow } from 'lucide-react';

import { HintTooltip } from '@/shared/ui/hint-tooltip';

interface Props {
  onCreate: () => void;
  t: (key: string) => string;
}

export function DealsHeaderActions({ onCreate, t }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
          <Workflow className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight">
            <HintTooltip text={t('hints.deals')} position="bottom">{t('deals.dealFunnel')}</HintTooltip>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('deals.subtitle')}</p>
        </div>
      </div>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('deals.addDeal')}</span>
      </button>
    </div>
  );
}
