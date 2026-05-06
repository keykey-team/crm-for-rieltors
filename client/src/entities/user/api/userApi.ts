import { httpClient } from '@/shared/api';

export interface UserApiPayload {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export const userApi = {
  getUsers: () => httpClient.get<UserApiPayload[]>('/users'),
  getUser: (id: string) => httpClient.get<UserApiPayload>(`/users/${id}`),
  createUser: (payload: Partial<UserApiPayload>) => httpClient.post<UserApiPayload, Partial<UserApiPayload>>('/users', payload),
  updateUser: (id: string, payload: Partial<UserApiPayload>) =>
    httpClient.put<UserApiPayload, Partial<UserApiPayload>>(`/users/${id}`, payload),
  deleteUser: (id: string) => httpClient.delete<void>(`/users/${id}`),
};
