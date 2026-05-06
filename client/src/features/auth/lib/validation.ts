import type { LoginPayload, SignupPayload } from '@/features/auth/model/types';

export function validateLoginPayload(payload: LoginPayload): boolean {
  return payload.email.trim().length > 0 && payload.password.trim().length > 0;
}

export function validateSignupPayload(payload: SignupPayload): boolean {
  return (
    payload.name.trim().length > 0 &&
    payload.email.trim().length > 0 &&
    payload.password.trim().length >= 6
  );
}
