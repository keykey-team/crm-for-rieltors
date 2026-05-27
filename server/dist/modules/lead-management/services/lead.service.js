"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLeads = listLeads;
exports.addLead = addLead;
exports.getLead = getLead;
exports.changeLead = changeLead;
exports.removeLead = removeLead;
exports.bulkLeadAction = bulkLeadAction;
const errors_1 = require("../../../common/shared-kernel/errors");
const roles_1 = require("../../../common/shared-kernel/roles");
const lead_distribution_repository_1 = require("../repositories/lead-distribution.repository");
const lead_repository_1 = require("../repositories/lead.repository");
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
function parseFloatOrNull(value) {
    return value ? parseFloat(String(value)) : null;
}
async function resolveAssignedTo(input, userId) {
    let assignedToId = input.assignedToId || userId || null;
    if (input.assignedToId)
        return assignedToId;
    const rules = await (0, lead_distribution_repository_1.findLeadDistributionRules)(true);
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
function assertCanAccessLead(lead, role, userId) {
    if (!lead)
        throw (0, errors_1.badRequest)('Not found');
    if (!(0, roles_1.isAdminRole)(role) && lead.assignedToId !== userId)
        throw (0, errors_1.forbidden)();
}
async function listLeads(query, userId, role) {
    const where = ownership(role, userId);
    if (query.search) {
        where.OR = [
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
            { email: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    if (query.status)
        where.status = query.status;
    if (query.source)
        where.source = query.source;
    if (query.managerId)
        where.assignedToId = query.managerId;
    return (0, lead_repository_1.findLeads)(where);
}
async function addLead(input, userId) {
    return (0, lead_repository_1.createLead)({
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        email: input.email ?? null,
        phone: input.phone,
        source: input.source ?? 'manual',
        status: input.status ?? 'new_lead',
        needType: input.needType ?? 'buy',
        budget: parseFloatOrNull(input.budget),
        budgetMax: parseFloatOrNull(input.budgetMax),
        districts: input.districts ?? null,
        propertyType: input.propertyType ?? null,
        notes: input.notes ?? null,
        lastContact: input.lastContact ?? null,
        priority: input.priority ?? 'medium',
        assignedToId: await resolveAssignedTo(input, userId),
    });
}
async function getLead(id, userId, role) {
    const lead = await (0, lead_repository_1.findLeadById)(id);
    assertCanAccessLead(lead, role, userId);
    return lead;
}
async function changeLead(id, input, userId, role) {
    const current = await (0, lead_repository_1.findLeadRecord)(id);
    assertCanAccessLead(current, role, userId);
    return (0, lead_repository_1.updateLead)(id, {
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
        ...(input.lastContact !== undefined ? { lastContact: input.lastContact || null } : {}),
        ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId || null } : {}),
    });
}
async function removeLead(id) {
    await (0, lead_repository_1.deleteLead)(id);
    return { success: true };
}
async function bulkLeadAction(input, userId, role) {
    const ids = input.ids;
    if (!Array.isArray(ids) || !ids.length)
        throw (0, errors_1.badRequest)('No ids');
    const where = { id: { in: ids }, ...ownership(role, userId) };
    if (input.action === 'delete')
        return { deleted: (await (0, lead_repository_1.deleteLeads)(where)).count };
    if (input.action === 'status' && input.value)
        return { updated: (await (0, lead_repository_1.updateLeads)(where, { status: input.value })).count };
    if (input.action === 'assign' && input.value)
        return { updated: (await (0, lead_repository_1.updateLeads)(where, { assignedToId: input.value })).count };
    throw (0, errors_1.badRequest)('Invalid action');
}
