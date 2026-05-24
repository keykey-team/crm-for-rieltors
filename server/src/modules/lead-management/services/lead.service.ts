import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { findLeadDistributionRules } from '../repositories/lead-distribution.repository';
import { createLead, deleteLead, deleteLeads, findLeadById, findLeadRecord, findLeads, updateLead, updateLeads } from '../repositories/lead.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

function parseFloatOrNull(value: unknown) {
  return value ? parseFloat(String(value)) : null;
}

async function resolveAssignedTo(input: Record<string, unknown>, userId?: string) {
  let assignedToId = (input.assignedToId as string | undefined) || userId || null;
  if (input.assignedToId) return assignedToId;

  const rules = await findLeadDistributionRules(true);
  for (const rule of rules) {
    const sourceMatch = !rule.source || rule.source === (input.source || 'manual');
    const districtMatch = !rule.district || rule.district === (input.districts || '');
    const typeMatch = !rule.propertyType || rule.propertyType === (input.propertyType || '');
    const needMatch = !rule.needType || rule.needType === (input.needType || 'buy');
    if (sourceMatch && districtMatch && typeMatch && needMatch) {
      assignedToId = rule.assignToId;
      break;
    }
  }
  return assignedToId;
}

function assertCanAccessLead(lead: { assignedToId: string | null } | null, role?: string, userId?: string) {
  if (!lead) throw badRequest('Not found');
  if (!isAdminRole(role) && lead.assignedToId !== userId) throw forbidden();
}

export async function listLeads(query: Record<string, string>, userId?: string, role?: string) {
  const where: Record<string, unknown> = ownership(role, userId);
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.managerId) where.assignedToId = query.managerId;
  return findLeads(where);
}

export async function addLead(input: Record<string, unknown>, userId?: string) {
  return createLead({
    firstName: input.firstName,
    lastName: input.lastName ?? null,
    email: input.email ?? null,
    phone: input.phone,
    source: input.source ?? 'manual',
    status: input.status ?? 'new',
    needType: input.needType ?? 'buy',
    budget: parseFloatOrNull(input.budget),
    budgetMax: parseFloatOrNull(input.budgetMax),
    districts: input.districts ?? null,
    propertyType: input.propertyType ?? null,
    notes: input.notes ?? null,
    priority: input.priority ?? 'medium',
    assignedToId: await resolveAssignedTo(input, userId),
  });
}

export async function getLead(id: string, userId?: string, role?: string) {
  const lead = await findLeadById(id);
  assertCanAccessLead(lead, role, userId);
  return lead;
}

export async function changeLead(id: string, input: Record<string, unknown>, userId?: string, role?: string) {
  const current = await findLeadRecord(id);
  assertCanAccessLead(current, role, userId);
  return updateLead(id, {
    ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
    ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.source !== undefined ? { source: input.source } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.needType !== undefined ? { needType: input.needType } : {}),
    ...(input.budget !== undefined ? { budget: parseFloatOrNull(input.budget) } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.districts !== undefined ? { districts: input.districts } : {}),
    ...(input.propertyType !== undefined ? { propertyType: input.propertyType } : {}),
    ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId || null } : {}),
  });
}

export async function removeLead(id: string) {
  await deleteLead(id);
  return { success: true };
}

export async function bulkLeadAction(input: Record<string, unknown>, userId?: string, role?: string) {
  const ids = input.ids;
  if (!Array.isArray(ids) || !ids.length) throw badRequest('No ids');
  const where = { id: { in: ids }, ...ownership(role, userId) };
  if (input.action === 'delete') return { deleted: (await deleteLeads(where)).count };
  if (input.action === 'status' && input.value) return { updated: (await updateLeads(where, { status: input.value })).count };
  if (input.action === 'assign' && input.value) return { updated: (await updateLeads(where, { assignedToId: input.value })).count };
  throw badRequest('Invalid action');
}

