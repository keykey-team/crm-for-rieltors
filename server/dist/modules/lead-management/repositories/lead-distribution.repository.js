"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLeadDistributionRules = findLeadDistributionRules;
exports.createLeadDistributionRule = createLeadDistributionRule;
exports.updateLeadDistributionRule = updateLeadDistributionRule;
exports.updateLeadDistributionPriorities = updateLeadDistributionPriorities;
exports.deleteLeadDistributionRule = deleteLeadDistributionRule;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findLeadDistributionRules(activeOnly = false) {
    return prisma_1.prisma.leadDistributionRule.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        include: activeOnly ? undefined : { assignTo: { select: { id: true, name: true } } },
        orderBy: { priority: 'desc' },
    });
}
async function createLeadDistributionRule(data) {
    return prisma_1.prisma.leadDistributionRule.create({
        data: data,
        include: { assignTo: { select: { id: true, name: true } } },
    });
}
async function updateLeadDistributionRule(id, data) {
    return prisma_1.prisma.leadDistributionRule.update({
        where: { id },
        data: data,
        include: { assignTo: { select: { id: true, name: true } } },
    });
}
async function updateLeadDistributionPriorities(items) {
    await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.leadDistributionRule.update({ where: { id: item.id }, data: { priority: item.priority } })));
}
async function deleteLeadDistributionRule(id) {
    return prisma_1.prisma.leadDistributionRule.delete({ where: { id } });
}
