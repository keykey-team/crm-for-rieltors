import { prisma } from '../../../common/infrastructure/db/prisma';

const managedUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  permissions: true,
  createdAt: true,
};

export async function findManagedUsers() {
  return prisma.user.findMany({
    select: managedUserSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createManagedUser(data: Record<string, unknown>) {
  return prisma.user.create({
    data: data as any,
    select: managedUserSelect,
  });
}

export async function updateManagedUser(id: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id },
    data: data as any,
    select: managedUserSelect,
  });
}

export async function deleteManagedUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
