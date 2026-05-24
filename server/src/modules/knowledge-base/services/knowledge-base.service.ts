import { createArticle, deleteArticle, findArticles, updateArticle } from '../repositories/knowledge-article.repository';

export async function listArticles(filters: { search?: string; category?: string }) {
  return findArticles(filters);
}

export async function addArticle(userId: string | undefined, input: Record<string, unknown>) {
  return createArticle({
    title: input.title,
    content: input.content,
    category: input.category ?? 'general',
    authorId: userId ?? null,
  });
}

export async function changeArticle(id: string, input: Record<string, unknown>) {
  return updateArticle(id, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.published !== undefined ? { published: input.published } : {}),
  });
}

export async function removeArticle(id: string) {
  await deleteArticle(id);
  return { success: true };
}

