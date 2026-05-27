"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countMonthlyUserMessages = countMonthlyUserMessages;
exports.findHelperHistory = findHelperHistory;
exports.createHelperMessage = createHelperMessage;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function countMonthlyUserMessages(userId, monthStart) {
    return prisma_1.prisma.helperMessage.count({
        where: {
            userId,
            role: 'user',
            createdAt: { gte: monthStart },
        },
    });
}
async function findHelperHistory(userId) {
    return prisma_1.prisma.helperMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { role: true, content: true, createdAt: true },
    });
}
async function createHelperMessage(userId, role, content) {
    return prisma_1.prisma.helperMessage.create({
        data: { userId, role, content },
    });
}
