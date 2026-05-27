"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDeals = findDeals;
exports.createDeal = createDeal;
exports.findDeal = findDeal;
exports.updateDeal = updateDeal;
exports.deleteDeal = deleteDeal;
exports.findDealComments = findDealComments;
exports.createDealComment = createDealComment;
exports.findDealChecklist = findDealChecklist;
exports.createDealChecklistItem = createDealChecklistItem;
exports.updateDealChecklistItem = updateDealChecklistItem;
exports.findLeadIdsForProperty = findLeadIdsForProperty;
exports.findDealIdsByPropertyId = findDealIdsByPropertyId;
exports.bulkSetDealStage = bulkSetDealStage;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findDeals(where) {
    return prisma_1.prisma.deal.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
            lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
            property: { select: { id: true, title: true, address: true } },
            assignedTo: { select: { id: true, name: true, avatar: true } },
        },
    });
}
async function createDeal(data) {
    return prisma_1.prisma.deal.create({ data: data });
}
async function findDeal(id) {
    return prisma_1.prisma.deal.findUnique({
        where: { id },
        include: { lead: true, property: true, assignedTo: { select: { id: true, name: true } } },
    });
}
async function updateDeal(id, data) {
    return prisma_1.prisma.deal.update({ where: { id }, data: data });
}
async function deleteDeal(id) {
    return prisma_1.prisma.deal.delete({ where: { id } });
}
async function findDealComments(dealId) {
    return prisma_1.prisma.dealComment.findMany({
        where: { dealId },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true } } },
    });
}
async function createDealComment(data) {
    return prisma_1.prisma.dealComment.create({
        data: data,
        include: { author: { select: { id: true, name: true, email: true } } },
    });
}
async function findDealChecklist(dealId) {
    return prisma_1.prisma.dealChecklist.findMany({ where: { dealId }, orderBy: { order: 'asc' } });
}
async function createDealChecklistItem(data) {
    return prisma_1.prisma.dealChecklist.create({ data: data });
}
async function updateDealChecklistItem(id, completed) {
    return prisma_1.prisma.dealChecklist.update({ where: { id }, data: { completed: completed } });
}
async function findLeadIdsForProperty(propertyId, excludeLeadId) {
    const leads = await prisma_1.prisma.lead.findMany({
        where: {
            deals: { some: { propertyId } },
            ...(excludeLeadId ? { id: { not: excludeLeadId } } : {}),
        },
        select: { id: true },
    });
    return leads.map((l) => l.id);
}
async function findDealIdsByPropertyId(propertyId, excludeDealId) {
    const deals = await prisma_1.prisma.deal.findMany({
        where: {
            propertyId,
            ...(excludeDealId ? { id: { not: excludeDealId } } : {}),
        },
        select: { id: true },
    });
    return deals.map((d) => d.id);
}
async function bulkSetDealStage(ids, stage) {
    if (ids.length === 0)
        return;
    await prisma_1.prisma.deal.updateMany({ where: { id: { in: ids } }, data: { stage } });
}
