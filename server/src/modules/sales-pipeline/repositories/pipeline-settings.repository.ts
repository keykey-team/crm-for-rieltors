import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findFunnelStages(funnelId?: string) {
  const where = funnelId
    ? { isActive: true, funnelId }
    : { isActive: true };
  return prisma.funnelStage.findMany({ where, orderBy: { order: 'asc' } });
}

export async function createFunnelStage(data: Record<string, unknown>) {
  const maxOrder = await prisma.funnelStage.aggregate({ _max: { order: true } });
  return prisma.funnelStage.create({ data: { ...(data as any), order: (maxOrder._max.order ?? -1) + 1 } });
}

export async function updateFunnelStage(id: string, data: Record<string, unknown>) {
  return prisma.funnelStage.update({ where: { id }, data: data as any });
}

export async function updateFunnelStageOrder(items: { id: string; order: number }[]) {
  await prisma.$transaction(items.map((item) => prisma.funnelStage.update({ where: { id: item.id }, data: { order: item.order } })));
}

export async function findFunnelStage(id: string) {
  return prisma.funnelStage.findUnique({ where: { id } });
}

export async function deactivateFunnelStage(id: string) {
  return prisma.funnelStage.update({ where: { id }, data: { isActive: false } });
}

export async function findDealCustomFields() {
  return prisma.dealCustomField.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
}

export async function createDealCustomField(data: Record<string, unknown>) {
  return prisma.dealCustomField.create({ data: data as any });
}

export async function updateDealCustomField(id: string, data: Record<string, unknown>) {
  return prisma.dealCustomField.update({ where: { id }, data: data as any });
}

export async function updateDealCustomFieldOrder(items: { id: string; order: number }[]) {
  await prisma.$transaction(items.map((item) => prisma.dealCustomField.update({ where: { id: item.id }, data: { order: item.order } })));
}

export async function deactivateDealCustomField(id: string) {
  return prisma.dealCustomField.update({ where: { id }, data: { isActive: false } });
}

export async function findDealCustomFieldValues(dealId: string) {
  return prisma.dealCustomFieldValue.findMany({ where: { dealId }, include: { field: true } });
}

export async function upsertDealCustomFieldValue(dealId: string, fieldId: string, value: string) {
  return prisma.dealCustomFieldValue.upsert({
    where: { dealId_fieldId: { dealId, fieldId } },
    update: { value },
    create: { dealId, fieldId, value },
  });
}

