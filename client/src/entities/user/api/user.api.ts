import type { User } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as User[]) : [];
}
