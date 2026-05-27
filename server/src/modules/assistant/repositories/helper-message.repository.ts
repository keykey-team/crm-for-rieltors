import { prisma } from '../../../common/infrastructure/db/prisma';

export async function countMonthlyUserMessages(userId: string, monthStart: Date) {
  return prisma.helperMessage.count({
    where: {
      userId,
      role: 'user',
      createdAt: { gte: monthStart },
    },
  });
}

export async function findHelperHistory(userId: string) {
  return prisma.helperMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { role: true, content: true, createdAt: true },
  });
}

export async function createHelperMessage(userId: string, role: string, content: string) {
  return prisma.helperMessage.create({
    data: { userId, role, content },
  });
}
