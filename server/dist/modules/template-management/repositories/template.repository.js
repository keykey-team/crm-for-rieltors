"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTemplates = findTemplates;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findTemplates(type) {
    return prisma_1.prisma.template.findMany({
        where: type ? { type } : {},
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
    });
}
async function createTemplate(data) {
    return prisma_1.prisma.template.create({ data: data });
}
async function updateTemplate(id, data) {
    return prisma_1.prisma.template.update({ where: { id }, data: data });
}
async function deleteTemplate(id) {
    return prisma_1.prisma.template.delete({ where: { id } });
}
