'use client';

import { useEffect, useMemo, useState } from 'react';

type DictionaryItem = { value?: string; label?: string; isActive?: boolean };
export type ShowingStatusOption = { value: string; label: string };

const FALLBACK_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

async function loadDictionary(category: string): Promise<DictionaryItem[]> {
  const response = await fetch(`/api/dictionaries?category=${category}`);
  if (!response.ok) throw new Error('Failed to load dictionaries');
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function mapFallback(t: (key: string) => string): ShowingStatusOption[] {
  return FALLBACK_STATUSES.map((value) => ({
    value,
    label: t(`showings.status.${value}`),
  }));
}

function toOptions(items: DictionaryItem[]): ShowingStatusOption[] {
  return items
    .filter((item): item is { value: string; label: string; isActive?: boolean } => Boolean(item?.value && item?.label))
    .filter((item) => item.isActive !== false)
    .map((item) => ({ value: item.value, label: item.label }));
}

export function useShowingStatusOptions(t: (key: string) => string) {
  const [items, setItems] = useState<ShowingStatusOption[]>([]);
  const fallback = useMemo(() => mapFallback(t), [t]);

  useEffect(() => {
    let active = true;

    loadDictionary('showing_status')
      .then((data) => {
        if (!active) return;
        setItems(toOptions(data));
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return items.length > 0 ? items : fallback;
}
