"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShowings = listShowings;
exports.getShowing = getShowing;
exports.addShowing = addShowing;
exports.changeShowing = changeShowing;
exports.removeShowing = removeShowing;
exports.listDuplicates = listDuplicates;
const errors_1 = require("../../../common/shared-kernel/errors");
const roles_1 = require("../../../common/shared-kernel/roles");
const showing_repository_1 = require("../repositories/showing.repository");
const ALLOWED_STATUS_TRANSITIONS = {
    scheduled: ['completed', 'cancelled', 'no_show'],
    completed: [],
    cancelled: [],
    no_show: [],
};
function ownershipFilter(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { agentId: userId };
}
function ensureRatingRule(status, rating) {
    if (rating !== undefined && rating !== null && status !== 'completed') {
        throw (0, errors_1.badRequest)('clientRating is allowed only for completed showings');
    }
}
function ensureStatusTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus)
        return;
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
        throw (0, errors_1.badRequest)(`Invalid status transition: ${currentStatus} -> ${nextStatus}`);
    }
}
function extractUpdateData(input) {
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
async function listShowings(query, userId, role) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const where = {
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
        (0, showing_repository_1.findShowings)(where, (page - 1) * limit, limit),
        (0, showing_repository_1.countShowings)(where),
    ]);
    return { items, total, page, limit };
}
async function getShowing(id, userId, role) {
    const showing = await (0, showing_repository_1.findShowing)(id);
    if (!showing)
        throw (0, errors_1.badRequest)('Showing not found');
    if (!(0, roles_1.isAdminRole)(role) && showing.agentId !== userId) {
        throw (0, errors_1.badRequest)('Showing not found');
    }
    return showing;
}
async function addShowing(input, userId) {
    const status = String(input.status || 'scheduled');
    ensureRatingRule(status, input.clientRating);
    const showing = await (0, showing_repository_1.createShowing)({
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
    await (0, showing_repository_1.createShowingActivityLog)({
        entityId: showing.id,
        action: 'create',
        details: `Showing created with status ${showing.status}`,
        userId,
    });
    if ((input.createEvent ?? true) && status === 'scheduled' && showing.agentId) {
        const startDate = new Date(showing.scheduledAt);
        const endDate = new Date(startDate.getTime() + showing.durationMin * 60000);
        await (0, showing_repository_1.createShowingEvent)({
            title: `Showing: ${showing.propertyId}`,
            description: showing.dealId ? `Deal ${showing.dealId}` : undefined,
            userId: showing.agentId,
            startDate,
            endDate,
        });
    }
    return getShowing(showing.id, userId, 'admin');
}
async function changeShowing(id, input, userId, role) {
    const current = await (0, showing_repository_1.findShowing)(id);
    if (!current)
        throw (0, errors_1.badRequest)('Showing not found');
    if (!(0, roles_1.isAdminRole)(role) && current.agentId !== userId) {
        throw (0, errors_1.badRequest)('Showing not found');
    }
    const nextStatus = String(input.status ?? current.status);
    ensureStatusTransition(current.status, nextStatus);
    ensureRatingRule(nextStatus, input.clientRating ?? current.clientRating);
    const updated = await (0, showing_repository_1.updateShowing)(id, extractUpdateData(input));
    await (0, showing_repository_1.createShowingActivityLog)({
        entityId: id,
        action: 'update',
        details: 'Showing updated',
        userId,
    });
    if (input.status !== undefined && input.status !== current.status) {
        await (0, showing_repository_1.createShowingActivityLog)({
            entityId: id,
            action: 'status_change',
            details: `${current.status} -> ${input.status}`,
            userId,
        });
    }
    return getShowing(updated.id, userId, role);
}
async function removeShowing(id, userId, role) {
    const current = await (0, showing_repository_1.findShowing)(id);
    if (!current)
        throw (0, errors_1.badRequest)('Showing not found');
    if (!(0, roles_1.isAdminRole)(role) && current.agentId !== userId) {
        throw (0, errors_1.badRequest)('Showing not found');
    }
    await (0, showing_repository_1.deleteShowing)(id);
    await (0, showing_repository_1.createShowingActivityLog)({
        entityId: id,
        action: 'delete',
        details: 'Showing deleted',
        userId,
    });
    return { success: true };
}
async function listDuplicates(propertyId, leadId, userId, role) {
    const duplicates = await (0, showing_repository_1.findShowingDuplicates)(propertyId, leadId);
    if ((0, roles_1.isAdminRole)(role))
        return duplicates;
    return duplicates.filter((item) => item.agentId === userId);
}
