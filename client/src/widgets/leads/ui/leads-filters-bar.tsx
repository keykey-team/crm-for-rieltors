'use client';

import { useRef, useState, useEffect } from 'react';
import { Search, LayoutGrid, List, ChevronDown } from 'lucide-react';

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

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  allLabel: string;
}

function FilterSelect({ value, onChange, options, allLabel }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find((o) => o.value === value)?.label ?? allLabel;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 border border-border/60 rounded-xl text-sm bg-card hover:bg-muted/40 transition whitespace-nowrap"
      >
        {current}
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 min-w-full bg-popover border border-border rounded-xl shadow-md overflow-y-auto max-h-48">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={cn(
              'w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition',
              value === '' && 'text-primary font-medium',
            )}
          >
            {allLabel}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition',
                value === o.value && 'text-primary font-medium',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={leadStatuses}
          allLabel={t('common.allStatuses')}
        />

        <FilterSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          options={leadSources}
          allLabel={t('common.allSources')}
        />

        {managers.length > 1 && (
          <FilterSelect
            value={managerFilter}
            onChange={setManagerFilter}
            options={managers.map((m) => ({ value: m.id, label: m.name || m.email || m.id }))}
            allLabel={t('common.allManagers')}
          />
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
