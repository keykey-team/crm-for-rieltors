import { prisma } from '../../../common/infrastructure/db/prisma';
import { AuthenticatedUserDto, SignupResultDto, UserCredentialsRecord } from '../models/auth.dto';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  accountType: true,
  plan: true,
  permissions: true,
  lastAgencyId: true,
};

export async function findUserCredentialsByEmail(email: string): Promise<UserCredentialsRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { ...publicUserSelect, password: true },
  });
}

export async function findPublicUserById(id: string): Promise<AuthenticatedUserDto | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export async function findUserIdByEmail(email: string): Promise<{ id: string } | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  accountType: string;
  plan: string;
}): Promise<SignupResultDto> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data,
      select: { id: true, email: true, name: true, role: true },
    });
    const agency = await tx.agency.create({
      data: {
        name: `${user.name || user.email} Agency`,
        slug: `agency-${user.id}`,
        ownerId: user.id,
        plan: data.plan,
      },
      select: { id: true },
    });
    await tx.agencyMembership.create({
      data: { agencyId: agency.id, userId: user.id, role: data.role === 'admin' ? 'owner' : data.role, isActive: true },
    });
    await tx.user.update({ where: { id: user.id }, data: { lastAgencyId: agency.id } });
    return { id: user.id, email: user.email };
  });
}
