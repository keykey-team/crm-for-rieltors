import { prisma } from '../../../common/infrastructure/db/prisma';

export async function getDashboardCounts(where: Record<string, unknown>, todayStart: Date, todayEnd: Date) {
  const [totalLeads, newLeads, totalDeals, activeDeals, totalProperties, totalTasks, pendingTasks, todayTasks] =
    await Promise.all([
      prisma.lead.count({ where: where as any }),
      prisma.lead.count({ where: { ...(where as any), status: 'new_lead' } }),
      prisma.deal.count({ where: where as any }),
      prisma.deal.count({ where: { ...(where as any), stage: { notIn: ['closed', 'rejected'] } } }),
      prisma.property.count(),
      prisma.task.count({ where: where as any }),
      prisma.task.count({ where: { ...(where as any), status: 'pending' } }),
      prisma.task.count({
        where: {
          ...(where as any),
          status: 'pending',
          dueDate: { gte: todayStart, lt: todayEnd },
        },
      }),
    ]);

  return { totalLeads, newLeads, totalDeals, activeDeals, totalProperties, totalTasks, pendingTasks, todayTasks };
}

export async function findRecentDashboardLeads(where: Record<string, unknown>) {
  return prisma.lead.findMany({
    where: where as any,
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function groupDashboardDealsByStage(where: Record<string, unknown>) {
  return prisma.deal.groupBy({
    by: ['stage'],
    _count: { id: true },
    where: where as any,
  });
}
