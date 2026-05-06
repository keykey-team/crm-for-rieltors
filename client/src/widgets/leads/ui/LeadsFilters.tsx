import { Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { LEAD_SOURCES, LEAD_STATUSES } from '@/shared/lib/constants';
import type { LeadFilters, LeadViewMode } from '@/widgets/leads/model/types';

interface LeadsFiltersProps {
  filters: LeadFilters;
  viewMode: LeadViewMode;
  t: (key: string) => string;
  onFiltersChange: (filters: LeadFilters) => void;
  onViewModeChange: (mode: LeadViewMode) => void;
}

export function LeadsFilters({
  filters,
  viewMode,
  t,
  onFiltersChange,
  onViewModeChange,
}: LeadsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder={t('leads.searchPlaceholder')}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <select
        value={filters.status}
        onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}
        className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">{t('common.allStatuses')}</option>
        {LEAD_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <select
        value={filters.source}
        onChange={(event) => onFiltersChange({ ...filters, source: event.target.value })}
        className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">{t('common.allSources')}</option>
        {LEAD_SOURCES.map((source) => (
          <option key={source.value} value={source.value}>
            {source.label}
          </option>
        ))}
      </select>
      <div className="flex border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => onViewModeChange('table')}
          className={cn('p-2 transition', viewMode === 'table' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('kanban')}
          className={cn('p-2 transition', viewMode === 'kanban' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
