import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findProperties(where: Record<string, unknown>) {
  return prisma.property.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function createProperty(data: Record<string, unknown>) {
  return prisma.property.create({ data: data as any });
}

export async function updateProperty(id: string, data: Record<string, unknown>) {
  return prisma.property.update({ where: { id }, data: data as any });
}

export async function deleteProperty(id: string) {
  return prisma.property.delete({ where: { id } });
}

export async function findPropertyUnits(propertyId: string) {
  return prisma.propertyUnit.findMany({
    where: { propertyId },
    orderBy: [{ section: 'asc' }, { floor: 'desc' }, { unitNumber: 'asc' }],
  });
}

export async function createPropertyUnit(data: Record<string, unknown>) {
  return prisma.propertyUnit.create({ data: data as any });
}

export async function updatePropertyUnit(id: string, data: Record<string, unknown>) {
  return prisma.propertyUnit.update({ where: { id }, data: data as any });
}

export async function deletePropertyUnit(id: string) {
  return prisma.propertyUnit.delete({ where: { id } });
}