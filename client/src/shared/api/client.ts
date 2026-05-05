export async function apiClient<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.status === 204 ? (null as T) : ((await response.json()) as T);
}
