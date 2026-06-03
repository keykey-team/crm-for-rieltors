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

export async function findManagedUsers(agencyId?: string) {
  return prisma.user.findMany({
    where: agencyId
      ? {
          memberships: {
            some: {
              agencyId,
              isActive: true,
            },
          },
        }
      : undefined,
    select: managedUserSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createManagedUser(data: Record<string, unknown>, agencyId?: string) {
  if (!agencyId) {
    return prisma.user.create({
      data: data as any,
      select: managedUserSelect,
    });
  }

  return prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        ...(data as any),
        lastAgencyId: agencyId,
      },
      select: managedUserSelect,
    });

    const rawRole = String((data as any).role ?? 'agent').toLowerCase();
    const membershipRole = rawRole === 'director' || rawRole === 'admin' ? 'admin' : 'agent';

    await tx.agencyMembership.upsert({
      where: { agencyId_userId: { agencyId, userId: user.id } },
      create: { agencyId, userId: user.id, role: membershipRole, isActive: true },
      update: { role: membershipRole, isActive: true },
    });

    return user;
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
