'use client';

import { useEffect, useState } from 'react';

const KEY = 'crm_current_agency_id';
const EVENT = 'crm_current_agency_changed';

declare global {
  interface Window {
    __agencyFetchPatched?: boolean;
  }
}

function patchAgencyHeader() {
  if (typeof window === 'undefined' || window.__agencyFetchPatched) return;
  const original = window.fetch.bind(window);
  const isApiRequest = (input: RequestInfo | URL): boolean => {
    if (typeof input === 'string') return input.startsWith('/api/');
    if (input instanceof URL) return input.pathname.startsWith('/api/');
    if (input instanceof Request) return input.url.startsWith('/api/');
    return false;
  };

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const currentAgencyId = localStorage.getItem(KEY);
    if (!currentAgencyId) return original(input, init);
    if (!isApiRequest(input)) return original(input, init);
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set('X-Agency-Id', currentAgencyId);
    return original(input, { ...(init ?? {}), headers });
  };
  window.__agencyFetchPatched = true;
}

export function setCurrentAgencyId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) localStorage.setItem(KEY, id);
  if (!id) localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function getCurrentAgencyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function useCurrentAgency() {
  const [currentAgencyId, setState] = useState<string | null>(null);

  useEffect(() => {
    patchAgencyHeader();
    const sync = () => setState(getCurrentAgencyId());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    currentAgencyId,
    setCurrentAgencyId: (id: string | null) => {
      setCurrentAgencyId(id);
      setState(id);
    },
  };
}
