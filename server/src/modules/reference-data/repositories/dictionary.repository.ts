import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findActiveDictionaries(category?: string) {
  return prisma.dictionary.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function createDictionary(data: Record<string, unknown>) {
  return prisma.dictionary.create({ data: data as any });
}

export async function updateDictionary(id: string, data: Record<string, unknown>) {
  return prisma.dictionary.update({ where: { id }, data: data as any });
}

export async function updateDictionaryOrder(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.dictionary.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );
}

export async function deactivateDictionary(id: string) {
  return prisma.dictionary.update({ where: { id }, data: { isActive: false } });
}

