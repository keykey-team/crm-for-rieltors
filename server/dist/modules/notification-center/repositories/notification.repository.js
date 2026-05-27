"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRecentActivityLogs = findRecentActivityLogs;
exports.findOverdueTasks = findOverdueTasks;
exports.countNewLeadsToday = countNewLeadsToday;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findRecentActivityLogs(now, userId, role) {
    return prisma_1.prisma.activityLog.findMany({
        where: {
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            ...(role === 'agent' ? { userId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } } },
    });
}
async function findOverdueTasks(where, now) {
    return prisma_1.prisma.task.findMany({
        where: { ...where, status: 'pending', dueDate: { lt: now } },
        select: { id: true, title: true, dueDate: true },
        take: 5,
    });
}
async function countNewLeadsToday(where, todayStart) {
    return prisma_1.prisma.lead.count({
        where: { ...where, createdAt: { gte: todayStart } },
    });
}
