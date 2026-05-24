import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findEvents(where: Record<string, unknown>, take = 200) {
  return prisma.event.findMany({
    where: where as any,
    orderBy: { startDate: 'asc' },
    take,
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function createEvent(data: Record<string, unknown>) {
  return prisma.event.create({ data: data as any });
}

export async function updateEvent(id: string, data: Record<string, unknown>) {
  return prisma.event.update({ where: { id }, data: data as any });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({ where: { id } });
}

export async function findCalendarToken(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { calendarToken: true },
  });
}

export async function updateCalendarToken(userId: string, token: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { calendarToken: token },
  });
}

export async function findUserByCalendarToken(token: string) {
  return prisma.user.findFirst({
    where: { calendarToken: token },
    select: { id: true, name: true },
  });
}

