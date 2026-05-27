export async function syncBackendSession(): Promise<boolean> {
  const res = await fetch('/api/auth/crm-session', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

export async function clearBackendSession(): Promise<boolean> {
  const res = await fetch('/api/auth/crm-session', {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.ok;
}
