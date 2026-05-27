import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findLeadDistributionRules(activeOnly = false) {
  return prisma.leadDistributionRule.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: activeOnly ? undefined : { assignTo: { select: { id: true, name: true } } },
    orderBy: { priority: 'desc' },
  });
}

export async function createLeadDistributionRule(data: Record<string, unknown>) {
  return prisma.leadDistributionRule.create({
    data: data as any,
    include: { assignTo: { select: { id: true, name: true } } },
  });
}

export async function updateLeadDistributionRule(id: string, data: Record<string, unknown>) {
  return prisma.leadDistributionRule.update({
    where: { id },
    data: data as any,
    include: { assignTo: { select: { id: true, name: true } } },
  });
}

export async function updateLeadDistributionPriorities(items: { id: string; priority: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.leadDistributionRule.update({ where: { id: item.id }, data: { priority: item.priority } }),
    ),
  );
}

export async function deleteLeadDistributionRule(id: string) {
  return prisma.leadDistributionRule.delete({ where: { id } });
}

