"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDealChecklist = exports.listDealComments = void 0;
exports.listDeals = listDeals;
exports.addDeal = addDeal;
exports.getDeal = getDeal;
exports.changeDeal = changeDeal;
exports.removeDeal = removeDeal;
exports.convertLeadToDeal = convertLeadToDeal;
exports.addDealComment = addDealComment;
exports.addDealChecklistItem = addDealChecklistItem;
exports.changeDealChecklistItem = changeDealChecklistItem;
const errors_1 = require("../../../common/shared-kernel/errors");
const roles_1 = require("../../../common/shared-kernel/roles");
const lead_management_1 = require("../../lead-management");
const funnel_repository_1 = require("../repositories/funnel.repository");
const deal_repository_1 = require("../repositories/deal.repository");
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
function parseFloatOrNull(value) {
    return value ? parseFloat(String(value)) : null;
}
async function resolveDealFunnelId(input) {
    if (input.funnelId !== undefined) {
        return input.funnelId ?? null;
    }
    const defaultFunnel = await (0, funnel_repository_1.findDefaultFunnel)();
    return defaultFunnel?.id ?? null;
}
async function listDeals(userId, role) {
    return (0, deal_repository_1.findDeals)(ownership(role, userId));
}
async function addDeal(input, userId) {
    const funnelId = await resolveDealFunnelId(input);
    return (0, deal_repository_1.createDeal)({
        title: input.title,
        stage: input.stage ?? 'new_lead',
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
async function getDeal(id) {
    const deal = await (0, deal_repository_1.findDeal)(id);
    if (!deal)
        throw (0, errors_1.badRequest)('Not found');
    return deal;
}
async function changeDeal(id, input) {
    return (0, deal_repository_1.updateDeal)(id, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.stage !== undefined ? { stage: input.stage } : {}),
        ...(input.funnelId !== undefined ? { funnelId: input.funnelId || null } : {}),
        ...(input.amount !== undefined ? { amount: parseFloatOrNull(input.amount) } : {}),
        ...(input.commission !== undefined ? { commission: parseFloatOrNull(input.commission) } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.leadId !== undefined ? { leadId: input.leadId } : {}),
        ...(input.propertyId !== undefined ? { propertyId: input.propertyId } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
}
async function removeDeal(id) {
    await (0, deal_repository_1.deleteDeal)(id);
    return { success: true };
}
async function convertLeadToDeal(leadId, input, userId) {
    const lead = await lead_management_1.leadFacade.getLeadRecord(leadId);
    if (!lead)
        throw (0, errors_1.badRequest)('Lead not found');
    const funnelId = await resolveDealFunnelId(input);
    const deal = await (0, deal_repository_1.createDeal)({
        title: input.title || `Угода: ${lead.firstName} ${lead.lastName || ''}`.trim(),
        stage: 'new_lead',
        funnelId,
        leadId: lead.id,
        assignedToId: lead.assignedToId || userId || null,
        amount: lead.budget || null,
        propertyId: input.propertyId || null,
    });
    await lead_management_1.leadFacade.updateLead(lead.id, { status: 'active' });
    return deal;
}
exports.listDealComments = deal_repository_1.findDealComments;
async function addDealComment(dealId, text, userId) {
    return (0, deal_repository_1.createDealComment)({ dealId, text, authorId: userId ?? null });
}
exports.listDealChecklist = deal_repository_1.findDealChecklist;
async function addDealChecklistItem(dealId, input) {
    return (0, deal_repository_1.createDealChecklistItem)({ dealId, title: input.title, order: input.order ?? 0 });
}
async function changeDealChecklistItem(input) {
    return (0, deal_repository_1.updateDealChecklistItem)(String(input.itemId), input.completed);
}
