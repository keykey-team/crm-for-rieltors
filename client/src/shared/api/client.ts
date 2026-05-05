import { httpClient } from './httpClient';

export async function apiClient<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const url = typeof input === 'string' ? input : input.toString();
  const method = (init?.method ?? 'GET').toUpperCase();

  if (method === 'GET') {
    return httpClient.get<T>(url, init);
  }

  if (method === 'POST') {
    return httpClient.post<T>(url, init?.body, init);
  }

  if (method === 'PUT') {
    return httpClient.put<T>(url, init?.body, init);
  }

  if (method === 'PATCH') {
    return httpClient.patch<T>(url, init?.body, init);
  }

  return httpClient.delete<T>(url, init);
}
