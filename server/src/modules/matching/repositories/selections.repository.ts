import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findSelectionById(id: string) {
  return prisma.clientSelection.findUnique({
    where: { id },
    include: {
      lead: true,
      createdBy: { select: { id: true, name: true, email: true, brandLogo: true, brandName: true } },
      items: {
        include: {
          property: {
            include: {
              photos: {
                where: { isPublic: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
}

export async function findSelectionBySlug(slug: string) {
  return prisma.clientSelection.findUnique({
    where: { publicSlug: slug },
    include: {
      lead: true,
      createdBy: { select: { id: true, name: true, email: true, brandLogo: true, brandName: true } },
      items: {
        include: {
          property: {
            include: {
              photos: {
                where: { isPublic: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
}

export async function findSelectionBySlugOnly(slug: string) {
  return prisma.clientSelection.findUnique({ where: { publicSlug: slug }, select: { id: true } });
}

export async function createSelection(data: Record<string, unknown>) {
  return prisma.clientSelection.create({ data: data as any });
}

export async function createSelectionItems(items: Array<Record<string, unknown>>) {
  if (!items.length) return { count: 0 };
  return prisma.selectionItem.createMany({ data: items as any, skipDuplicates: true });
}

export async function listSelectionsByUser(createdById: string, leadId?: string) {
  return prisma.clientSelection.findMany({
    where: {
      createdById,
      ...(leadId ? { leadId } : {}),
    },
    include: {
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      items: { include: { property: true }, orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function updateSelection(id: string, data: Record<string, unknown>) {
  return prisma.clientSelection.update({ where: { id }, data: data as any });
}

export async function deleteSelection(id: string) {
  return prisma.clientSelection.delete({ where: { id } });
}

export async function removeSelectionItem(selectionId: string, itemId: string) {
  return prisma.selectionItem.deleteMany({ where: { id: itemId, selectionId } });
}

export async function findSelectionItemById(itemId: string) {
  return prisma.selectionItem.findUnique({ where: { id: itemId } });
}

export async function updateSelectionItem(itemId: string, data: Record<string, unknown>) {
  return prisma.selectionItem.update({ where: { id: itemId }, data: data as any });
}

export async function updateSelectionViews(id: string) {
  return prisma.clientSelection.update({
    where: { id },
    data: {
      viewsCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });
}

export async function createCommunication(data: Record<string, unknown>) {
  return prisma.communication.create({ data: data as any });
}
