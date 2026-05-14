'use client';

import { Users, Plus, Upload } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { HintTooltip } from '@/shared/ui/hint-tooltip';

interface Props {
  leadsCount: number;
  importing: boolean;
  handleExcelImport: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  openCreateDialog: () => void;
  t: (key: string) => string;
}

export function LeadsHeaderActions({ leadsCount, importing, handleExcelImport, openCreateDialog, t }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight">
            <HintTooltip text={t('hints.leads')} position="bottom">{t('leads.title')}</HintTooltip>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{leadsCount} {t('common.contacts')}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <label className={cn('flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm font-semibold cursor-pointer hover:bg-muted transition active:scale-95', importing && 'opacity-50 pointer-events-none')}>
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">{importing ? t('leads.importing') : 'Excel'}</span>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelImport} disabled={importing} />
        </label>

        <button
          onClick={openCreateDialog}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('leads.addLead')}</span>
        </button>
      </div>
    </div>
  );
}
