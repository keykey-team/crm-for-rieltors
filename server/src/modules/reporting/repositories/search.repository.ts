import { prisma } from '../../../common/infrastructure/db/prisma';

export async function searchRecords(q: string, where: Record<string, unknown>) {
  const [leads, deals, properties, tasks] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...(where as any),
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, phone: true, status: true },
      take: 5,
    }),
    prisma.deal.findMany({
      where: {
        ...(where as any),
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, stage: true, amount: true },
      take: 5,
    }),
    prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, address: true, type: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        ...(where as any),
        title: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, title: true, status: true, priority: true },
      take: 5,
    }),
  ]);

  return { leads, deals, properties, tasks };
}
