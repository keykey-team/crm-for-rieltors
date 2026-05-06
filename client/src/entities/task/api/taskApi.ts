import { httpClient } from '@/shared/api';

export interface TaskApiPayload {
  id: string;
  title: string;
  type?: string;
  priority?: string;
  status?: string;
  [key: string]: unknown;
}

export const taskApi = {
  getTasks: (query?: string) => httpClient.get<TaskApiPayload[]>(`/tasks${query ? `?${query}` : ''}`),
  getTask: (id: string) => httpClient.get<TaskApiPayload>(`/tasks/${id}`),
  createTask: (payload: Partial<TaskApiPayload>) => httpClient.post<TaskApiPayload, Partial<TaskApiPayload>>('/tasks', payload),
  updateTask: (id: string, payload: Partial<TaskApiPayload>) =>
    httpClient.put<TaskApiPayload, Partial<TaskApiPayload>>(`/tasks/${id}`, payload),
  deleteTask: (id: string) => httpClient.delete<void>(`/tasks/${id}`),
};
