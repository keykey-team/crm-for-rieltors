import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { BaseService } from '../../../common/infrastructure/BaseService';
import { BadRequestError, NotFoundError } from '../../../common/errors';
import { EventBus } from '../../../common/messaging';
import { LeadRepository } from '../repositories/LeadRepository';
import { CreateLeadDto } from '../models/dto/CreateLeadDto';
import { UpdateLeadDto } from '../models/dto/UpdateLeadDto';
import { LeadCreatedEvent } from '../events/LeadCreatedEvent';
import { LeadUpdatedEvent } from '../events/LeadUpdatedEvent';

@injectable()
export class LeadService extends BaseService {
  constructor(
    @inject(LeadRepository) private readonly leadRepository: LeadRepository,
    @inject(EventBus) private readonly eventBus: EventBus,
  ) {
    super();
  }

  async list(filters: { search?: string; status?: string; source?: string; userId: string; role: string }) {
    const where: Prisma.LeadWhereInput = {};

    if (filters.role === 'agent') {
      where.assignedToId = filters.userId;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;

    return this.leadRepository.findMany({ where, take: 100 });
  }

  async getById(id: string) {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    return lead;
  }

  async create(dto: CreateLeadDto, currentUser: { id: string }) {
    if (!dto.firstName || !dto.phone) {
      throw new BadRequestError('firstName and phone are required');
    }

    const assignedToId = await this.resolveAssignee(dto, currentUser.id);

    const lead = await this.leadRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      source: dto.source ?? 'manual',
      needType: dto.needType ?? 'buy',
      budget: dto.budget,
      budgetMax: dto.budgetMax,
      districts: dto.districts,
      propertyType: dto.propertyType,
      notes: dto.notes,
      priority: dto.priority ?? 'medium',
      assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
    });

    await this.eventBus.publish(new LeadCreatedEvent({ leadId: lead.id, userId: currentUser.id }));
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, currentUser: { id: string }) {
    await this.getById(id);

    const lead = await this.leadRepository.update(id, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.source !== undefined && { source: dto.source }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.needType !== undefined && { needType: dto.needType }),
      ...(dto.budget !== undefined && { budget: dto.budget }),
      ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.districts !== undefined && { districts: dto.districts }),
      ...(dto.propertyType !== undefined && { propertyType: dto.propertyType }),
      ...(dto.assignedToId !== undefined && {
        assignedTo: dto.assignedToId ? { connect: { id: dto.assignedToId } } : { disconnect: true },
      }),
    });

    await this.eventBus.publish(new LeadUpdatedEvent({ leadId: lead.id, userId: currentUser.id }));
    return lead;
  }

  async remove(id: string) {
    await this.getById(id);
    await this.leadRepository.delete(id);
    return { success: true };
  }

  private async resolveAssignee(dto: CreateLeadDto, fallbackUserId: string): Promise<string> {
    if (dto.assignedToId) {
      return dto.assignedToId;
    }

    const rules = await this.leadRepository.getActiveDistributionRules();

    for (const rule of rules) {
      const matchSource = !rule.source || rule.source === (dto.source ?? 'manual');
      const matchDistrict = !rule.district || rule.district === (dto.districts ?? null);
      const matchPropType = !rule.propertyType || rule.propertyType === (dto.propertyType ?? null);
      const matchNeedType = !rule.needType || rule.needType === (dto.needType ?? 'buy');

      if (matchSource && matchDistrict && matchPropType && matchNeedType) {
        return rule.assignToId;
      }
    }

    return fallbackUserId;
  }
}
