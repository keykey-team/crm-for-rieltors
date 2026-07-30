"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findShowings = findShowings;
exports.countShowings = countShowings;
exports.findShowing = findShowing;
exports.createShowing = createShowing;
exports.updateShowing = updateShowing;
exports.deleteShowing = deleteShowing;
exports.findShowingDuplicates = findShowingDuplicates;
exports.createShowingActivityLog = createShowingActivityLog;
exports.createShowingEvent = createShowingEvent;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findShowings(where, skip, take) {
    return prisma_1.prisma.showing.findMany({
        where: where,
        orderBy: { scheduledAt: 'desc' },
        skip,
        take,
        include: {
            deal: { select: { id: true, title: true } },
            property: { select: { id: true, title: true, address: true } },
            lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
            agent: { select: { id: true, name: true, email: true } },
        },
    });
}
async function countShowings(where) {
    return prisma_1.prisma.showing.count({ where: where });
}
async function findShowing(id) {
    return prisma_1.prisma.showing.findUnique({
        where: { id },
        include: {
            deal: { select: { id: true, title: true } },
            property: { select: { id: true, title: true, address: true } },
            lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
            agent: { select: { id: true, name: true, email: true } },
        },
    });
}
async function createShowing(data) {
    return prisma_1.prisma.showing.create({ data: data });
}
async function updateShowing(id, data) {
    return prisma_1.prisma.showing.update({ where: { id }, data: data });
}
async function deleteShowing(id) {
    return prisma_1.prisma.showing.delete({ where: { id } });
}
async function findShowingDuplicates(propertyId, leadId) {
    return prisma_1.prisma.showing.findMany({
        where: { propertyId, leadId },
        orderBy: { scheduledAt: 'desc' },
        include: {
            deal: { select: { id: true, title: true } },
            property: { select: { id: true, title: true } },
            lead: { select: { id: true, firstName: true, lastName: true } },
            agent: { select: { id: true, name: true } },
        },
    });
}
async function createShowingActivityLog(data) {
    return prisma_1.prisma.activityLog.create({
        data: {
            entityType: 'showing',
            entityId: data.entityId,
            action: data.action,
            details: data.details,
            userId: data.userId ?? null,
        },
    });
}
async function createShowingEvent(data) {
    return prisma_1.prisma.event.create({
        data: {
            title: data.title,
            description: data.description ?? null,
            type: 'showing',
            userId: data.userId ?? null,
            startDate: data.startDate,
            endDate: data.endDate ?? null,
        },
    });
}
