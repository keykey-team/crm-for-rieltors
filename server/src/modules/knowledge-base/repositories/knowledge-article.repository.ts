import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findArticles(filters: { search?: string; category?: string }) {
  const where: Record<string, unknown> = { published: true };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.category) where.category = filters.category;

  return prisma.knowledgeArticle.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function createArticle(data: Record<string, unknown>) {
  return prisma.knowledgeArticle.create({ data: data as any });
}

export async function updateArticle(id: string, data: Record<string, unknown>) {
  return prisma.knowledgeArticle.update({ where: { id }, data: data as any });
}

export async function deleteArticle(id: string) {
  return prisma.knowledgeArticle.delete({ where: { id } });
}

