import { badRequest } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { leadFacade } from '../../lead-management';
import {
  createDeal,
  createDealChecklistItem,
  createDealComment,
  deleteDeal,
  findDeal,
  findDealChecklist,
  findDealComments,
  findDeals,
  updateDeal,
  updateDealChecklistItem,
} from '../repositories/deal.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

function parseFloatOrNull(value: unknown) {
  return value ? parseFloat(String(value)) : null;
}

export async function listDeals(userId?: string, role?: string) {
  return findDeals(ownership(role, userId));
}

export async function addDeal(input: Record<string, unknown>, userId?: string) {
  return createDeal({
    title: input.title,
    stage: input.stage ?? 'new_lead',
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
  return updateDeal(id, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.stage !== undefined ? { stage: input.stage } : {}),
    ...(input.amount !== undefined ? { amount: parseFloatOrNull(input.amount) } : {}),
    ...(input.commission !== undefined ? { commission: parseFloatOrNull(input.commission) } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.leadId !== undefined ? { leadId: input.leadId } : {}),
    ...(input.propertyId !== undefined ? { propertyId: input.propertyId } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });
}

export async function removeDeal(id: string) {
  await deleteDeal(id);
  return { success: true };
}

export async function convertLeadToDeal(leadId: string, input: Record<string, unknown>, userId?: string) {
  const lead = await leadFacade.getLeadRecord(leadId);
  if (!lead) throw badRequest('Lead not found');
  const deal = await createDeal({
    title: input.title || `Угода: ${lead.firstName} ${lead.lastName || ''}`.trim(),
    stage: 'new_lead',
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
