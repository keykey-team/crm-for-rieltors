'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { syncBackendSession, clearBackendSession } from '@/shared/lib/backend-auth';

type PatchedWindow = Window & {
  __crmAuthFetchPatched?: boolean;
};

function getApiPath(input: RequestInfo | URL): string | null {
  try {
    if (typeof input === 'string' || input instanceof URL) {
      const url = new URL(input.toString(), window.location.origin);
      return url.origin === window.location.origin ? url.pathname : null;
    }

    const url = new URL(input.url, window.location.origin);
    return url.origin === window.location.origin ? url.pathname : null;
  } catch {
    return null;
  }
}

async function getResponseError(res: Response): Promise<string> {
  try {
    const data = await res.clone().json();
    return String(data?.error ?? data?.message ?? '');
  } catch {
    return '';
  }
}

function shouldRetryAuth(input: RequestInfo | URL, res: Response): boolean {
  if (res.status !== 401) return false;

  const path = getApiPath(input);
  if (!path?.startsWith('/api/')) return false;
  return !path.startsWith('/api/auth/');
}

function withApiCredentials(input: RequestInfo | URL, init?: RequestInit): RequestInit | undefined {
  const path = getApiPath(input);
  if (!path?.startsWith('/api/') || init?.credentials) return init;
  return { ...init, credentials: 'include' };
}

function installAuthFetchRetry(): void {
  if (typeof window === 'undefined') return;

  const patchedWindow = window as PatchedWindow;
  if (patchedWindow.__crmAuthFetchPatched) return;

  const originalFetch = window.fetch.bind(window);
  patchedWindow.__crmAuthFetchPatched = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestInit = withApiCredentials(input, init);
    const res = await originalFetch(input, requestInit);
    if (!shouldRetryAuth(input, res)) return res;

    const error = await getResponseError(res);
    if (error && !/unauthorized|invalid session token/i.test(error)) return res;

    const syncRes = await originalFetch('/api/auth/crm-session', {
      method: 'POST',
      credentials: 'include',
    });
    if (!syncRes.ok) return res;

    return originalFetch(input, requestInit);
  };
}

export function CrmSessionBridge() {
  const { status } = useSession();
  const syncedRef = useRef(false);

  useLayoutEffect(() => {
    installAuthFetchRetry();
  }, []);

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

