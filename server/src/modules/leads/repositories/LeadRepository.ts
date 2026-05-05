import { Prisma } from '@prisma/client';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/infrastructure/BaseRepository';

@injectable()
export class LeadRepository extends BaseRepository {
  async findMany(params: {
    where: Prisma.LeadWhereInput;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.lead.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true } }, deals: true, tasks: true },
    });
  }

  async create(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }

  async getActiveDistributionRules() {
    return this.prisma.leadDistributionRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });
  }
}
