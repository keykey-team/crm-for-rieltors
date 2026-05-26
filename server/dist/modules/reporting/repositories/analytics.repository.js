"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAnalyticsRecords = findAnalyticsRecords;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
function createdAtFilter(dateFilter) {
    return Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
}
async function findAnalyticsRecords(where, dateFilter) {
    const datedWhere = { ...where, ...createdAtFilter(dateFilter) };
    return Promise.all([
        prisma_1.prisma.lead.findMany({
            where: datedWhere,
            select: { id: true, source: true, status: true, createdAt: true, assignedToId: true },
        }),
        prisma_1.prisma.deal.findMany({
            where: datedWhere,
            select: {
                id: true,
                stage: true,
                amount: true,
                commission: true,
                createdAt: true,
                updatedAt: true,
                assignedToId: true,
            },
        }),
        prisma_1.prisma.task.findMany({
            where: datedWhere,
            select: {
                id: true,
                status: true,
                type: true,
                assignedToId: true,
                createdAt: true,
                completedAt: true,
            },
        }),
        prisma_1.prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    ]);
}
