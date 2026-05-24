import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findDeals(where: Record<string, unknown>) {
  return prisma.deal.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      property: { select: { id: true, title: true, address: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function createDeal(data: Record<string, unknown>) {
  return prisma.deal.create({ data: data as any });
}

export async function findDeal(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: { lead: true, property: true, assignedTo: { select: { id: true, name: true } } },
  });
}

export async function updateDeal(id: string, data: Record<string, unknown>) {
  return prisma.deal.update({ where: { id }, data: data as any });
}

export async function deleteDeal(id: string) {
  return prisma.deal.delete({ where: { id } });
}

export async function findDealComments(dealId: string) {
  return prisma.dealComment.findMany({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}

export async function createDealComment(data: Record<string, unknown>) {
  return prisma.dealComment.create({
    data: data as any,
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}

export async function findDealChecklist(dealId: string) {
  return prisma.dealChecklist.findMany({ where: { dealId }, orderBy: { order: 'asc' } });
}

export async function createDealChecklistItem(data: Record<string, unknown>) {
  return prisma.dealChecklist.create({ data: data as any });
}

export async function updateDealChecklistItem(id: string, completed: unknown) {
  return prisma.dealChecklist.update({ where: { id }, data: { completed: completed as any } });
}

