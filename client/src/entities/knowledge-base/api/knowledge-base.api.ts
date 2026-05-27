import type { KnowledgeBaseArticle, KnowledgeBaseQuery, KnowledgeBaseUpsertInput } from '../model/types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

export async function getKnowledgeBaseArticles(query: KnowledgeBaseQuery = {}): Promise<KnowledgeBaseArticle[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  const suffix = params.toString();
  const res = await fetch(`/api/knowledge-base${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as KnowledgeBaseArticle[]) : [];
}

export async function createKnowledgeBaseArticle(payload: KnowledgeBaseUpsertInput): Promise<KnowledgeBaseArticle> {
  const res = await fetch('/api/knowledge-base', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<KnowledgeBaseArticle>(res);
}

export async function updateKnowledgeBaseArticle(id: string, payload: KnowledgeBaseUpsertInput): Promise<KnowledgeBaseArticle> {
  const res = await fetch(`/api/knowledge-base/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<KnowledgeBaseArticle>(res);
}

export async function deleteKnowledgeBaseArticle(id: string): Promise<void> {
  const res = await fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete knowledge-base article');
}
