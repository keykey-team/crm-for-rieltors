'use client';

import { Filter } from 'lucide-react';
import type { SelectionFilter } from '../model/selectionFilters';

interface Props {
  value: SelectionFilter;
  onChange: (value: SelectionFilter) => void;
  t: (key: string) => string;
}

const options: SelectionFilter[] = ['all', 'viewed', 'not_viewed', 'with_reactions', 'want_to_view', 'active', 'expired'];

export function SelectionFilters({ value, onChange, t }: Props) {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SelectionFilter)}
        className="w-full appearance-none rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>{t(`selections.filter.${option}`)}</option>
        ))}
      </select>
    </div>
  );
}
