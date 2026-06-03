async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      (data && typeof data === 'object' && ('error' in data || 'message' in data))
        ? String((data as { error?: unknown; message?: unknown }).error ?? (data as { message?: unknown }).message)
        : 'Request failed',
    );
  }
  return data as T;
}

export interface PresignedUploadResponse {
  uploadUrl?: string;
  url?: string;
  cloud_storage_path?: string;
  cloudStoragePath?: string;
}

export async function getUploadPresigned(payload: Record<string, unknown>) {
  const response = await fetch('/api/upload/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<PresignedUploadResponse>(response);
}