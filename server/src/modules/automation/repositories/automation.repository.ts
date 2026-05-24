import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findAutomations() {
  return prisma.automation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function createAutomation(data: Record<string, unknown>) {
  return prisma.automation.create({ data: data as any });
}

export async function updateAutomation(id: string, data: Record<string, unknown>) {
  return prisma.automation.update({ where: { id }, data: data as any });
}

export async function deleteAutomation(id: string) {
  return prisma.automation.delete({ where: { id } });
}

