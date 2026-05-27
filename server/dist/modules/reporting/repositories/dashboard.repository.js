"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardCounts = getDashboardCounts;
exports.findRecentDashboardLeads = findRecentDashboardLeads;
exports.groupDashboardDealsByStage = groupDashboardDealsByStage;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function getDashboardCounts(where, todayStart, todayEnd) {
    const [totalLeads, newLeads, totalDeals, activeDeals, totalProperties, totalTasks, pendingTasks, todayTasks] = await Promise.all([
        prisma_1.prisma.lead.count({ where: where }),
        prisma_1.prisma.lead.count({ where: { ...where, status: 'new_lead' } }),
        prisma_1.prisma.deal.count({ where: where }),
        prisma_1.prisma.deal.count({ where: { ...where, stage: { notIn: ['closed', 'rejected'] } } }),
        prisma_1.prisma.property.count(),
        prisma_1.prisma.task.count({ where: where }),
        prisma_1.prisma.task.count({ where: { ...where, status: 'pending' } }),
        prisma_1.prisma.task.count({
            where: {
                ...where,
                status: 'pending',
                dueDate: { gte: todayStart, lt: todayEnd },
            },
        }),
    ]);
    return { totalLeads, newLeads, totalDeals, activeDeals, totalProperties, totalTasks, pendingTasks, todayTasks };
}
async function findRecentDashboardLeads(where) {
    return prisma_1.prisma.lead.findMany({
        where: where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            source: true,
            status: true,
            createdAt: true,
        },
    });
}
async function groupDashboardDealsByStage(where) {
    return prisma_1.prisma.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
        where: where,
    });
}
