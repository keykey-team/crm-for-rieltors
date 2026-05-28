import { prisma } from '../../../common/infrastructure/db/prisma';
import { Prisma } from '@prisma/client';

export function findUserMemberships(userId: string) {
  return prisma.agencyMembership.findMany({
    where: { userId, isActive: true },
    include: { agency: true },
    orderBy: { joinedAt: 'asc' },
  });
}

export function createAgencyWithOwner(data: { userId: string; name: string; slug: string }) {
  return prisma.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.userId,
      },
    });

    await tx.agencyMembership.create({
      data: { agencyId: agency.id, userId: data.userId, role: 'owner', isActive: true },
    });

    await tx.user.update({ where: { id: data.userId }, data: { lastAgencyId: agency.id } });
    return agency;
  });
}

export function updateAgency(agencyId: string, data: Prisma.AgencyUpdateInput) {
  return prisma.agency.update({ where: { id: agencyId }, data });
}

export function findAgencyMembership(userId: string, agencyId: string) {
  return prisma.agencyMembership.findUnique({ where: { agencyId_userId: { agencyId, userId } } });
}

export function findAgencyById(id: string) {
  return prisma.agency.findUnique({ where: { id } });
}

export function listAgencyMembers(agencyId: string) {
  return prisma.agencyMembership.findMany({
    where: { agencyId },
    include: { user: { select: { id: true, email: true, name: true, avatar: true } } },
    orderBy: { joinedAt: 'asc' },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
}

export function upsertMembership(agencyId: string, userId: string, role: string) {
  return prisma.agencyMembership.upsert({
    where: { agencyId_userId: { agencyId, userId } },
    update: { role, isActive: true },
    create: { agencyId, userId, role, isActive: true },
  });
}

export function updateMembership(agencyId: string, userId: string, data: Prisma.AgencyMembershipUpdateInput) {
  return prisma.agencyMembership.update({ where: { agencyId_userId: { agencyId, userId } }, data });
}

export function deleteMembership(agencyId: string, userId: string) {
  return prisma.agencyMembership.delete({ where: { agencyId_userId: { agencyId, userId } } });
}

export function setLastAgency(userId: string, agencyId: string) {
  return prisma.user.update({ where: { id: userId }, data: { lastAgencyId: agencyId } });
}
