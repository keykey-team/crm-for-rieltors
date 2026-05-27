import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findRecentActivityLogs(now: Date, userId?: string, role?: string) {
  return prisma.activityLog.findMany({
    where: {
      createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      ...(role === 'agent' ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true } } },
  });
}

export async function findOverdueTasks(where: Record<string, unknown>, now: Date) {
  return prisma.task.findMany({
    where: { ...(where as any), status: 'pending', dueDate: { lt: now } },
    select: { id: true, title: true, dueDate: true },
    take: 5,
  });
}

export async function countNewLeadsToday(where: Record<string, unknown>, todayStart: Date) {
  return prisma.lead.count({
    where: { ...(where as any), createdAt: { gte: todayStart } },
  });
}
