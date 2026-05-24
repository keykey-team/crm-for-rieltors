import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findTemplates(type?: string) {
  return prisma.template.findMany({
    where: type ? { type } : {},
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function createTemplate(data: Record<string, unknown>) {
  return prisma.template.create({ data: data as any });
}

export async function updateTemplate(id: string, data: Record<string, unknown>) {
  return prisma.template.update({ where: { id }, data: data as any });
}

export async function deleteTemplate(id: string) {
  return prisma.template.delete({ where: { id } });
}

