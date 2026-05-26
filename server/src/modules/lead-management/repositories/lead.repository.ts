import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findLeads(where: Record<string, unknown>) {
  return prisma.lead.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
  });
}

export async function createLead(data: Record<string, unknown>) {
  return prisma.lead.create({ data: data as any });
}

export async function findLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      deals: true,
      tasks: true,
    },
  });
}

export async function findLeadRecord(id: string) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function updateLead(id: string, data: Record<string, unknown>) {
  return prisma.lead.update({ where: { id }, data: data as any });
}

export async function deleteLead(id: string) {
  return prisma.lead.delete({ where: { id } });
}

export async function deleteLeads(where: Record<string, unknown>) {
  return prisma.lead.deleteMany({ where: where as any });
}

export async function updateLeads(where: Record<string, unknown>, data: Record<string, unknown>) {
  return prisma.lead.updateMany({ where: where as any, data: data as any });
}

