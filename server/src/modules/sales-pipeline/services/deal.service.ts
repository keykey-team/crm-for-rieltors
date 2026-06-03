import { badRequest } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { leadFacade } from '../../lead-management';
import { findDefaultFunnel } from '../repositories/funnel.repository';
import {
  bulkSetDealStage,
  countDeals,
  createDeal,
  createDealChecklistItem,
  createDealComment,
  deleteDeal,
  findDeal,
  findDealChecklist,
  findDealComments,
  findDealIdsByPropertyId,
  findDeals,
  updateDeal,
  updateDealChecklistItem,
  deleteDealChecklistItem,
} from '../repositories/deal.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

function parseFloatOrNull(value: unknown) {
  return value ? parseFloat(String(value)) : null;
}

function normalizeText(value: unknown) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

function buildDealWhere(query: Record<string, unknown>, userId?: string, role?: string) {
  const where: Record<string, unknown> = { ...ownership(role, userId) };
  const funnelId = normalizeText(query.funnelId);
  const stage = normalizeText(query.stage);
  const managerId = normalizeText(query.managerId);
  const currency = normalizeText(query.currency);
  const search = normalizeText(query.query);

  if (funnelId) where.funnelId = funnelId;
  if (stage) where.stage = stage;
  if (managerId) where.assignedToId = managerId;
  if (currency) where.currency = currency;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      {
        lead: {
          is: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
      {
        property: {
          is: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
      {
        assignedTo: {
          is: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  return where;
}

async function resolveDealFunnelId(input: Record<string, unknown>) {
  if (input.funnelId !== undefined) {
    return input.funnelId ?? null;
  }

  const defaultFunnel = await findDefaultFunnel();
  return defaultFunnel?.id ?? null;
}

export async function listDeals(query: Record<string, unknown>, userId?: string, role?: string) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const where = buildDealWhere(query, userId, role);

  const [items, total] = await Promise.all([
    findDeals(where, (page - 1) * limit, limit),
    countDeals(where),
  ]);

  return { items, total, page, limit, hasMore: page * limit < total };
}

export async function addDeal(input: Record<string, unknown>, userId?: string) {
  const funnelId = await resolveDealFunnelId(input);

  return createDeal({
    title: input.title,
    stage: input.stage ?? 'new_lead',
    dealType: input.dealType ?? null,
    funnelId,
    amount: parseFloatOrNull(input.amount),
    commission: parseFloatOrNull(input.commission),
    currency: input.currency ?? 'USD',
    leadId: input.leadId ?? null,
    propertyId: input.propertyId ?? null,
    assignedToId: input.assignedToId ?? userId ?? null,
    notes: input.notes ?? null,
  });
}

export async function getDeal(id: string) {
  const deal = await findDeal(id);
  if (!deal) throw badRequest('Not found');
  return deal;
}

export async function changeDeal(id: string, input: Record<string, unknown>) {
  const result = await updateDeal(id, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.stage !== undefined ? { stage: input.stage } : {}),
    ...(input.dealType !== undefined ? { dealType: input.dealType || null } : {}),
    ...(input.funnelId !== undefined ? { funnelId: input.funnelId || null } : {}),
    ...(input.amount !== undefined ? { amount: parseFloatOrNull(input.amount) } : {}),
    ...(input.commission !== undefined ? { commission: parseFloatOrNull(input.commission) } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.leadId !== undefined ? { leadId: input.leadId } : {}),
    ...(input.propertyId !== undefined ? { propertyId: input.propertyId } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  if (input.stage === 'success') {
    const deal = await findDeal(id);
    if (deal?.propertyId) {
      const otherDealIds = await findDealIdsByPropertyId(deal.propertyId, id);
      if (otherDealIds.length > 0) {
        await bulkSetDealStage(otherDealIds, 'object_cancelled');
        return { ...result, _affectedCount: otherDealIds.length };
      }
    }
  }

  return result;
}

export async function removeDeal(id: string) {
  await deleteDeal(id);
  return { success: true };
}

export async function convertLeadToDeal(leadId: string, input: Record<string, unknown>, userId?: string) {
  const lead = await leadFacade.getLeadRecord(leadId);
  if (!lead) throw badRequest('Lead not found');
  const funnelId = await resolveDealFunnelId(input);
  const deal = await createDeal({
    title: input.title || `Угода: ${lead.firstName} ${lead.lastName || ''}`.trim(),
    stage: 'new_lead',
    dealType: input.dealType ?? lead.needType ?? null,
    funnelId,
    leadId: lead.id,
    assignedToId: lead.assignedToId || userId || null,
    amount: lead.budget || null,
    propertyId: input.propertyId || null,
  });
  await leadFacade.updateLead(lead.id, { status: 'active' });
  return deal;
}

export const listDealComments = findDealComments;

export async function addDealComment(dealId: string, text: unknown, userId?: string) {
  return createDealComment({ dealId, text, authorId: userId ?? null });
}

export const listDealChecklist = findDealChecklist;

export async function addDealChecklistItem(dealId: string, input: Record<string, unknown>) {
  return createDealChecklistItem({ dealId, title: input.title, order: input.order ?? 0 });
}

export async function changeDealChecklistItem(input: Record<string, unknown>) {
  return updateDealChecklistItem(String(input.itemId), input.completed);
}

export async function removeDealChecklistItem(itemId: string) {
  return deleteDealChecklistItem(itemId);
}
