'use client';

import { useEffect, useState } from 'react';
import { getAgencies } from '../api/agencyApi';
import { Agency } from './types';
import { setCurrentAgencyId, useCurrentAgency } from './useCurrentAgency';

export function useAgencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentAgencyId } = useCurrentAgency();

  useEffect(() => {
    getAgencies()
      .then(setAgencies)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currentAgencyId && agencies[0]?.id) setCurrentAgencyId(agencies[0].id);
  }, [agencies, currentAgencyId]);

  return { agencies, loading, currentAgencyId };
}
