import { signIn } from 'next-auth/react';
import type { AuthActionResult, LoginPayload, SignupPayload } from '@/features/auth/model/types';

export async function loginWithCredentials(payload: LoginPayload): Promise<AuthActionResult> {
  const response = await signIn('credentials', { ...payload, redirect: false });

  if (response?.error) {
    return { ok: false, errorKey: 'auth.errorCredentials' };
  }

  return { ok: true };
}

export async function signupAndLogin(payload: SignupPayload): Promise<AuthActionResult> {
  try {
    const signupResponse = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const signupData = await signupResponse.json();
    if (!signupResponse.ok) {
      return { ok: false, errorKey: signupData?.error ?? 'auth.errorGeneral' };
    }

    const loginResult = await loginWithCredentials({
      email: payload.email,
      password: payload.password,
    });

    if (!loginResult.ok) {
      return { ok: false, errorKey: 'auth.errorLogin' };
    }

    return { ok: true };
  } catch {
    return { ok: false, errorKey: 'auth.errorServer' };
  }
}
