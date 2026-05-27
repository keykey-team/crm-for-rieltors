import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findActivityLogs(filters: { entityType?: string; entityId?: string }) {
  return prisma.activityLog.findMany({
    where: {
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

