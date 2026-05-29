'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPropertyPriceHistory, getPropertyPriceStats } from '../api/propertyPriceHistoryApi';
import type { PriceStats, PropertyPricePoint } from './types';

export function usePriceHistory(propertyId?: string) {
  const [items, setItems] = useState<PropertyPricePoint[]>([]);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const [history, statsData] = await Promise.all([
        getPropertyPriceHistory(propertyId, { limit: 20, page: 1 }),
        getPropertyPriceStats(propertyId),
      ]);
      setItems(history.items);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, stats, loading, reload };
}
