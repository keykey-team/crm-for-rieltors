export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  accountType: 'agent' | 'agency';
}

export async function signup(payload: SignupPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const res = await fetch(`${apiBase}/api/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Signup failed' };
  return { ok: true };
}
