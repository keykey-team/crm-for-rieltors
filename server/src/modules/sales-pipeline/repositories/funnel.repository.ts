import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findFunnels() {
  return prisma.funnel.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { stages: { where: { isActive: true }, orderBy: { order: 'asc' } } },
  });
}

export async function countFunnels() {
  return prisma.funnel.count({ where: { isActive: true } });
}

export async function findFunnel(id: string) {
  return prisma.funnel.findUnique({ where: { id } });
}

export async function findDefaultFunnel() {
  return prisma.funnel.findFirst({
    where: { isActive: true },
    orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
  });
}

export async function createFunnel(data: { name: string }) {
  const maxOrder = await prisma.funnel.aggregate({ _max: { order: true } });
  return prisma.funnel.create({
    data: { name: data.name, order: (maxOrder._max.order ?? -1) + 1 } as any,
    include: { stages: { where: { isActive: true }, orderBy: { order: 'asc' } } },
  });
}

export async function updateFunnel(id: string, data: { name?: string }) {
  return prisma.funnel.update({ where: { id }, data });
}

export async function deactivateFunnel(id: string) {
  return prisma.funnel.update({ where: { id }, data: { isActive: false } });
}

export async function findFunnelStagesByFunnel(funnelId: string | null) {
  const where = funnelId
    ? { isActive: true, funnelId }
    : { isActive: true, funnelId: null };
  return prisma.funnelStage.findMany({ where, orderBy: { order: 'asc' } });
}
