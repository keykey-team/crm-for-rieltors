'use client';

import { ListFilter, Plus, Workflow } from 'lucide-react';

import type { Funnel } from '@/entities/settings';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';

interface Props {
  onCreate: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  funnels: Funnel[];
  selectedFunnelId: string | null;
  onSelectFunnel: (value: string) => void;
  t: (key: string) => string;
}

export function DealsHeaderActions({ onCreate, onOpenFilters, activeFilterCount, funnels, selectedFunnelId, onSelectFunnel, t }: Props) {
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {funnels.length > 0 && selectedFunnelId ? (
          <div className="min-w-[240px]">
            <Select value={selectedFunnelId} onValueChange={onSelectFunnel}>
              <SelectTrigger className="rounded-xl h-11 bg-card">
                <SelectValue placeholder={t('deals.selectFunnel')} />
              </SelectTrigger>
              <SelectContent>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>{funnel.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted/60 transition"
        >
          <ListFilter className="w-4 h-4" />
          <span>{t('common.filter')}</span>
          {activeFilterCount > 0 ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{activeFilterCount}</span> : null}
        </button>

        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('deals.addDeal')}</span>
        </button>
      </div>
    </div>
  );
}
