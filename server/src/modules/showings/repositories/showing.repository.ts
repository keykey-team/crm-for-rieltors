import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findShowings(where: Record<string, unknown>, skip: number, take: number) {
  return prisma.showing.findMany({
    where: where as any,
    orderBy: { scheduledAt: 'desc' },
    skip,
    take,
    include: {
      deal: { select: { id: true, title: true } },
      property: { select: { id: true, title: true, address: true } },
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      agent: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function countShowings(where: Record<string, unknown>) {
  return prisma.showing.count({ where: where as any });
}

export async function findShowing(id: string) {
  return prisma.showing.findUnique({
    where: { id },
    include: {
      deal: { select: { id: true, title: true } },
      property: { select: { id: true, title: true, address: true } },
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      agent: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createShowing(data: Record<string, unknown>) {
  return prisma.showing.create({ data: data as any });
}

export async function updateShowing(id: string, data: Record<string, unknown>) {
  return prisma.showing.update({ where: { id }, data: data as any });
}

export async function deleteShowing(id: string) {
  return prisma.showing.delete({ where: { id } });
}

export async function findShowingDuplicates(propertyId: string, leadId: string) {
  return prisma.showing.findMany({
    where: { propertyId, leadId },
    orderBy: { scheduledAt: 'desc' },
    include: {
      deal: { select: { id: true, title: true } },
      property: { select: { id: true, title: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
      agent: { select: { id: true, name: true } },
    },
  });
}

export async function createShowingActivityLog(data: {
  entityId: string;
  action: string;
  details?: string;
  userId?: string;
}) {
  return prisma.activityLog.create({
    data: {
      entityType: 'showing',
      entityId: data.entityId,
      action: data.action,
      details: data.details,
      userId: data.userId ?? null,
    },
  });
}

export async function createShowingEvent(data: {
  title: string;
  description?: string;
  userId?: string;
  startDate: Date;
  endDate?: Date;
}) {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      type: 'showing',
      userId: data.userId ?? null,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
    },
  });
}
