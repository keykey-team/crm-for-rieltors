'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { syncBackendSession, clearBackendSession } from '@/shared/lib/backend-auth';

export function CrmSessionBridge() {
  const { status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !syncedRef.current) {
      syncedRef.current = true;
      void syncBackendSession();
      return;
    }

    if (status === 'unauthenticated') {
      syncedRef.current = false;
      void clearBackendSession();
    }
  }, [status]);

  return null;
}

