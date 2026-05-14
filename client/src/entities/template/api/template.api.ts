import type { Template, TemplateUpsertInput, TemplatesQuery } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getTemplates(query: TemplatesQuery = {}): Promise<Template[]> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  const suffix = params.toString();
  const res = await fetch(`/api/templates${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Template[]) : [];
}

export async function createTemplate(payload: TemplateUpsertInput): Promise<Template> {
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Template>(res);
}

export async function updateTemplate(id: string, payload: TemplateUpsertInput): Promise<Template> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<Template>(res);
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete template');
}
