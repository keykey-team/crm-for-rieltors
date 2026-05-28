import { useCallback, useEffect, useState } from 'react';
import { listShowings } from '../api/showingsApi';
import type { Showing, ShowingsQuery } from './types';

export function useShowings(query: ShowingsQuery) {
  const [items, setItems] = useState<Showing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listShowings(query);
      setItems(response.items);
      setTotal(response.total);
    } finally {
      setLoading(false);
    }
  }, [query.agentId, query.dealId, query.from, query.leadId, query.limit, query.page, query.propertyId, query.status, query.to]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, total, loading, reload };
}
