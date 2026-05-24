import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findTasks(where: Record<string, unknown>) {
  return prisma.task.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: {
      lead: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function createTask(data: Record<string, unknown>) {
  return prisma.task.create({ data: data as any });
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  return prisma.task.update({ where: { id }, data: data as any });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

