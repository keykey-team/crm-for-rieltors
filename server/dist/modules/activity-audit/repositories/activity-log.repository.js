"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActivityLogs = findActivityLogs;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findActivityLogs(filters) {
    return prisma_1.prisma.activityLog.findMany({
        where: {
            ...(filters.entityType ? { entityType: filters.entityType } : {}),
            ...(filters.entityId ? { entityId: filters.entityId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true, email: true } } },
    });
}
