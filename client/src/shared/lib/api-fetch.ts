export async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const fieldMessage =
          data.fields && typeof data.fields === 'object'
            ? (Object.values(data.fields) as unknown[]).find(
                (v): v is string => typeof v === 'string' && v.length > 0,
              )
            : undefined;
        message = fieldMessage || data.error || data.message || message;
      }
    } catch {
      // response body is not JSON — keep default message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
