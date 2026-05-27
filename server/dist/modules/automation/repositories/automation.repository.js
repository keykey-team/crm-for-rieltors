"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAutomations = findAutomations;
exports.createAutomation = createAutomation;
exports.updateAutomation = updateAutomation;
exports.deleteAutomation = deleteAutomation;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findAutomations() {
    return prisma_1.prisma.automation.findMany({
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
    });
}
async function createAutomation(data) {
    return prisma_1.prisma.automation.create({ data: data });
}
async function updateAutomation(id, data) {
    return prisma_1.prisma.automation.update({ where: { id }, data: data });
}
async function deleteAutomation(id) {
    return prisma_1.prisma.automation.delete({ where: { id } });
}
