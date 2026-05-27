'use client';

import { Search, LayoutGrid, List } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

type Option = { value: string; label: string };
type Manager = { id: string; name?: string | null; email?: string | null };

interface Props {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  managerFilter: string;
  setManagerFilter: (value: string) => void;
  managers: Manager[];
  leadStatuses: Option[];
  leadSources: Option[];
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
  t: (key: string) => string;
}

export function LeadsFiltersBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  managerFilter,
  setManagerFilter,
  managers,
  leadStatuses,
  leadSources,
  viewMode,
  setViewMode,
  t,
}: Props) {
  return (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('leads.searchPlaceholder')}
          className="w-full pl-9 pr-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">{t('common.allStatuses')}</option>
          {leadStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">{t('common.allSources')}</option>
          {leadSources.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {managers.length > 1 && (
          <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">{t('common.allManagers')}</option>
            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
          </select>
        )}

        <div className="flex bg-card rounded-xl border border-border/60 dark:border-border/40 p-0.5 ml-auto">
          <button onClick={() => setViewMode('table')} className={cn('p-2 rounded-lg transition-all', viewMode === 'table' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('kanban')} className={cn('p-2 rounded-lg transition-all', viewMode === 'kanban' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
