import { httpClient } from '@/shared/api';
import type { LoginPayload, SignupPayload } from '@/features/auth/model/types';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'director' | 'agent';
}

export const authApi = {
  login: (payload: LoginPayload) => httpClient.post<SessionUser, LoginPayload>('/auth/login', payload),
  register: (payload: SignupPayload) => httpClient.post<SessionUser, SignupPayload>('/auth/register', payload),
  logout: () => httpClient.post<{ success: boolean }, undefined>('/auth/logout'),
  getSession: () => httpClient.get<SessionUser>('/auth/session'),
};
