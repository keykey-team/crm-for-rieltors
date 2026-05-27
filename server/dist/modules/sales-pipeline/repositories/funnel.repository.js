"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFunnels = findFunnels;
exports.countFunnels = countFunnels;
exports.findFunnel = findFunnel;
exports.findDefaultFunnel = findDefaultFunnel;
exports.createFunnel = createFunnel;
exports.updateFunnel = updateFunnel;
exports.deactivateFunnel = deactivateFunnel;
exports.findFunnelStagesByFunnel = findFunnelStagesByFunnel;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findFunnels() {
    return prisma_1.prisma.funnel.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { stages: { where: { isActive: true }, orderBy: { order: 'asc' } } },
    });
}
async function countFunnels() {
    return prisma_1.prisma.funnel.count({ where: { isActive: true } });
}
async function findFunnel(id) {
    return prisma_1.prisma.funnel.findUnique({ where: { id } });
}
async function findDefaultFunnel() {
    return prisma_1.prisma.funnel.findFirst({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
}
async function createFunnel(data) {
    const maxOrder = await prisma_1.prisma.funnel.aggregate({ _max: { order: true } });
    return prisma_1.prisma.funnel.create({
        data: { name: data.name, order: (maxOrder._max.order ?? -1) + 1 },
        include: { stages: { where: { isActive: true }, orderBy: { order: 'asc' } } },
    });
}
async function updateFunnel(id, data) {
    return prisma_1.prisma.funnel.update({ where: { id }, data });
}
async function deactivateFunnel(id) {
    return prisma_1.prisma.funnel.update({ where: { id }, data: { isActive: false } });
}
async function findFunnelStagesByFunnel(funnelId) {
    const where = funnelId
        ? { isActive: true, funnelId }
        : { isActive: true, funnelId: null };
    return prisma_1.prisma.funnelStage.findMany({ where, orderBy: { order: 'asc' } });
}
