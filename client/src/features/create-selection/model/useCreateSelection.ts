'use client';

import { useState } from 'react';
import { createSelection } from '@/entities/client-selection';

export function useCreateSelection() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: { leadId: string; propertyIds: string[]; title?: string; message?: string }) => {
    setLoading(true);
    try {
      return await createSelection(payload);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}
