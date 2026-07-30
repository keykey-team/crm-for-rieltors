import { badRequest } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import {
  countShowings,
  createShowing,
  createShowingActivityLog,
  createShowingEvent,
  deleteShowing,
  findShowing,
  findShowingDuplicates,
  findShowings,
  updateShowing,
} from '../repositories/showing.repository';
import type { ShowingStatus } from '../controllers/showing.schemas';

type ShowingInput = Record<string, unknown>;

const ALLOWED_STATUS_TRANSITIONS: Record<ShowingStatus, ShowingStatus[]> = {
  scheduled: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
};

function ownershipFilter(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { agentId: userId };
}

function ensureRatingRule(status: string, rating: unknown) {
  if (rating !== undefined && rating !== null && status !== 'completed') {
    throw badRequest('clientRating is allowed only for completed showings');
  }
}

function ensureStatusTransition(currentStatus: string, nextStatus: string) {
  if (currentStatus === nextStatus) return;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus as ShowingStatus] ?? [];
  if (!allowed.includes(nextStatus as ShowingStatus)) {
    throw badRequest(`Invalid status transition: ${currentStatus} -> ${nextStatus}`);
  }
}

function extractUpdateData(input: ShowingInput) {
  return {
    ...(input.dealId !== undefined ? { dealId: input.dealId ?? null } : {}),
    ...(input.propertyId !== undefined ? { propertyId: input.propertyId } : {}),
    ...(input.leadId !== undefined ? { leadId: input.leadId ?? null } : {}),
    ...(input.agentId !== undefined ? { agentId: input.agentId ?? null } : {}),
    ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
    ...(input.durationMin !== undefined ? { durationMin: input.durationMin } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.feedback !== undefined ? { feedback: input.feedback ?? null } : {}),
    ...(input.clientRating !== undefined ? { clientRating: input.clientRating ?? null } : {}),
    ...(input.agentNotes !== undefined ? { agentNotes: input.agentNotes ?? null } : {}),
  };
}

export async function listShowings(query: ShowingInput, userId?: string, role?: string) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  const where: Record<string, unknown> = {
    ...ownershipFilter(role, userId),
    ...(query.dealId ? { dealId: query.dealId } : {}),
    ...(query.propertyId ? { propertyId: query.propertyId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.agentId ? { agentId: query.agentId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  if (query.from || query.to) {
    where.scheduledAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  const [items, total] = await Promise.all([
    findShowings(where, (page - 1) * limit, limit),
    countShowings(where),
  ]);

  return { items, total, page, limit };
}

export async function getShowing(id: string, userId?: string, role?: string) {
  const showing = await findShowing(id);
  if (!showing) throw badRequest('Showing not found');
  if (!isAdminRole(role) && showing.agentId !== userId) {
    throw badRequest('Showing not found');
  }
  return showing;
}

export async function addShowing(input: ShowingInput, userId?: string) {
  const status = String(input.status || 'scheduled');
  ensureRatingRule(status, input.clientRating);

  const showing = await createShowing({
    dealId: input.dealId ?? null,
    propertyId: input.propertyId,
    leadId: input.leadId ?? null,
    agentId: input.agentId ?? userId ?? null,
    scheduledAt: input.scheduledAt,
    durationMin: input.durationMin ?? 30,
    status,
    feedback: input.feedback ?? null,
    clientRating: input.clientRating ?? null,
    agentNotes: input.agentNotes ?? null,
  });

  await createShowingActivityLog({
    entityId: showing.id,
    action: 'create',
    details: `Showing created with status ${showing.status}`,
    userId,
  });

  if ((input.createEvent ?? true) && status === 'scheduled' && showing.agentId) {
    const startDate = new Date(showing.scheduledAt);
    const endDate = new Date(startDate.getTime() + showing.durationMin * 60000);
    await createShowingEvent({
      title: `Showing: ${showing.propertyId}`,
      description: showing.dealId ? `Deal ${showing.dealId}` : undefined,
      userId: showing.agentId,
      startDate,
      endDate,
    });
  }

  return getShowing(showing.id, userId, 'admin');
}

export async function changeShowing(id: string, input: ShowingInput, userId?: string, role?: string) {
  const current = await findShowing(id);
  if (!current) throw badRequest('Showing not found');
  if (!isAdminRole(role) && current.agentId !== userId) {
    throw badRequest('Showing not found');
  }

  const nextStatus = String(input.status ?? current.status);
  ensureStatusTransition(current.status, nextStatus);
  ensureRatingRule(nextStatus, input.clientRating ?? current.clientRating);

  const updated = await updateShowing(id, extractUpdateData(input));

  await createShowingActivityLog({
    entityId: id,
    action: 'update',
    details: 'Showing updated',
    userId,
  });

  if (input.status !== undefined && input.status !== current.status) {
    await createShowingActivityLog({
      entityId: id,
      action: 'status_change',
      details: `${current.status} -> ${input.status}`,
      userId,
    });
  }

  return getShowing(updated.id, userId, role);
}

export async function removeShowing(id: string, userId?: string, role?: string) {
  const current = await findShowing(id);
  if (!current) throw badRequest('Showing not found');
  if (!isAdminRole(role) && current.agentId !== userId) {
    throw badRequest('Showing not found');
  }

  await deleteShowing(id);
  await createShowingActivityLog({
    entityId: id,
    action: 'delete',
    details: 'Showing deleted',
    userId,
  });

  return { success: true };
}

export async function listDuplicates(propertyId: string, leadId: string, userId?: string, role?: string) {
  const duplicates = await findShowingDuplicates(propertyId, leadId);
  if (isAdminRole(role)) return duplicates;
  return duplicates.filter((item: { agentId: string | null }) => item.agentId === userId);
}
