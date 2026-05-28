import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findLeadForMatching(leadId: string) {
  return prisma.lead.findUnique({ where: { id: leadId } });
}

export async function findPropertiesForMatching() {
  return prisma.property.findMany({
    where: {
      NOT: { status: { in: ['sold', 'archived'] } },
    },
    include: {
      photos: {
        where: { isPublic: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
}
