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

const SYSTEM_STAGES = [
  { value: 'new_lead', label: 'Новий лід', color: '#5AC8FA', order: 0 },
  { value: 'success', label: 'Успішно', color: '#30D158', order: 997 },
  { value: 'rejected', label: 'Відмова', color: '#FF453A', order: 998 },
  { value: 'object_cancelled', label: "Об'єкт скасовано", color: '#8E8E93', order: 999 },
] as const;

export async function ensureSystemStages() {
  for (const stage of SYSTEM_STAGES) {
    await prisma.funnelStage.upsert({
      where: { value: stage.value },
      // Make existing stages global (funnelId: null) if they aren't already
      update: { funnelId: null, label: stage.label, color: stage.color, order: stage.order, isActive: true },
      create: { ...stage, funnelId: null, isDefault: true },
    });
  }
}

export async function createFunnel(data: { name: string }) {
  const maxOrder = await prisma.funnel.aggregate({ _max: { order: true } });
  const funnel = await prisma.funnel.create({
    data: { name: data.name, order: (maxOrder._max.order ?? -1) + 1 },
  });
  await ensureSystemStages();
  return prisma.funnel.findUnique({
    where: { id: funnel.id },
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
