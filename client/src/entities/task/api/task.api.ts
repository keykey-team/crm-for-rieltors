import type { Task, TaskUpsertInput, TasksQuery } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getTasks(query: TasksQuery = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  const suffix = params.toString();
  const res = await fetch(`/api/tasks${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Task[]) : [];
}

export async function createTask(payload: TaskUpsertInput): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Task>(res);
}

export async function updateTask(id: string, payload: Partial<TaskUpsertInput>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}
