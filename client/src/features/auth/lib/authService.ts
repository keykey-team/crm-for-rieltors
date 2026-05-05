import { authApi } from '@/features/auth/api/authApi';
import type { AuthActionResult, LoginPayload, SignupPayload } from '@/features/auth/model/types';

export async function loginWithCredentials(payload: LoginPayload): Promise<AuthActionResult> {
  try {
    await authApi.login(payload);
    return { ok: true };
  } catch {
    return { ok: false, errorKey: 'auth.errorCredentials' };
  }
}

export async function signupAndLogin(payload: SignupPayload): Promise<AuthActionResult> {
  try {
    await authApi.register(payload);
    return { ok: true };
  } catch {
    return { ok: false, errorKey: 'auth.errorGeneral' };
  }
}

export async function logoutSession(): Promise<void> {
  await authApi.logout();
}
