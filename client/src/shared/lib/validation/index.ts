import { ZodSchema, ZodError } from 'zod';

export * from './schemas';

/** Парсит данные формы через Zod-схему.
 *  Возвращает `{ ok: true, data }` или `{ ok: false, errors }` где errors — объект поле→сообщение. */
export function parseForm<T>(
  schema: ZodSchema<T>,
  values: unknown,
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  const result = schema.safeParse(values);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of (result.error as ZodError).issues) {
    const key = issue.path.join('.') || '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
