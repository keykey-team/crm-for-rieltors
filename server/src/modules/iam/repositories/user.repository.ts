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
  return prisma.user.create({
    data,
    select: { id: true, email: true },
  });
}
