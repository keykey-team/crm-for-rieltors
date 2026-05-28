'use client';

import { useEffect, useState } from 'react';
import { getLeadMatches } from '@/entities/client-selection';

interface LeadMatch {
  id: string;
  title: string;
  score: number;
}

export function useLeadMatches(leadId: string) {
  const [matches, setMatches] = useState<LeadMatch[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    getLeadMatches(leadId, 10).then(setMatches).catch(() => setMatches([]));
  }, [leadId]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return { matches, selected, toggle };
}
