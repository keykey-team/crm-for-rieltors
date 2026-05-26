import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findAftercarePlans() {
  return prisma.aftercarePlan.findMany({
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function updateAftercarePlanOrder(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.aftercarePlan.update({ where: { id: item.id }, data: { order: item.order } })),
  );
}

export async function createAftercarePlan(data: Record<string, unknown>, steps: unknown) {
  return prisma.aftercarePlan.create({
    data: {
      ...(data as any),
      steps: Array.isArray(steps) ? { create: steps as any[] } : undefined,
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
}

export async function replaceAftercareSteps(planId: string, steps: unknown[]) {
  await prisma.aftercareStep.deleteMany({ where: { planId } });
  if (steps.length) {
    await prisma.aftercareStep.createMany({
      data: steps.map((step: any) => ({ ...step, planId })),
    });
  }
}

export async function updateAftercarePlan(id: string, data: Record<string, unknown>) {
  return prisma.aftercarePlan.update({
    where: { id },
    data: data as any,
    include: { steps: { orderBy: { order: 'asc' } } },
  });
}

export async function deleteAftercarePlan(id: string) {
  return prisma.aftercarePlan.delete({ where: { id } });
}

