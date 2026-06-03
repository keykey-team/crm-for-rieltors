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

  const replaceSelection = useCallback((updated: ClientSelection) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const removeSelectionFromList = useCallback((selectionId: string) => {
    setItems((current) => current.filter((item) => item.id !== selectionId));
  }, []);

  return { items, loading, reload, replaceSelection, removeSelectionFromList };
}
