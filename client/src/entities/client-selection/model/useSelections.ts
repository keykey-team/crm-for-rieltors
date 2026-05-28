'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSelections } from '../api/clientSelectionApi';
import type { ClientSelection } from './types';

export function useSelections(leadId?: string) {
  const [items, setItems] = useState<ClientSelection[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getSelections(leadId));
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, reload };
}
