import { prisma } from '../../../common/infrastructure/db/prisma';

function createdAtFilter(dateFilter: Record<string, Date>) {
  return Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
}

export async function findAnalyticsRecords(where: Record<string, unknown>, dateFilter: Record<string, Date>) {
  const datedWhere = { ...(where as any), ...createdAtFilter(dateFilter) };
  return Promise.all([
    prisma.lead.findMany({
      where: datedWhere,
      select: { id: true, source: true, status: true, createdAt: true, assignedToId: true },
    }),
    prisma.deal.findMany({
      where: datedWhere,
      select: {
        id: true,
        stage: true,
        amount: true,
        commission: true,
        createdAt: true,
        updatedAt: true,
        assignedToId: true,
      },
    }),
    prisma.task.findMany({
      where: datedWhere,
      select: {
        id: true,
        status: true,
        type: true,
        assignedToId: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
  ]);
}
