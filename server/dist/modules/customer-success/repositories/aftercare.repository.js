"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAftercarePlans = findAftercarePlans;
exports.updateAftercarePlanOrder = updateAftercarePlanOrder;
exports.createAftercarePlan = createAftercarePlan;
exports.replaceAftercareSteps = replaceAftercareSteps;
exports.updateAftercarePlan = updateAftercarePlan;
exports.deleteAftercarePlan = deleteAftercarePlan;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findAftercarePlans() {
    return prisma_1.prisma.aftercarePlan.findMany({
        include: { steps: { orderBy: { order: 'asc' } } },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
}
async function updateAftercarePlanOrder(items) {
    await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.aftercarePlan.update({ where: { id: item.id }, data: { order: item.order } })));
}
async function createAftercarePlan(data, steps) {
    return prisma_1.prisma.aftercarePlan.create({
        data: {
            ...data,
            steps: Array.isArray(steps) ? { create: steps } : undefined,
        },
        include: { steps: { orderBy: { order: 'asc' } } },
    });
}
async function replaceAftercareSteps(planId, steps) {
    await prisma_1.prisma.aftercareStep.deleteMany({ where: { planId } });
    if (steps.length) {
        await prisma_1.prisma.aftercareStep.createMany({
            data: steps.map((step) => ({ ...step, planId })),
        });
    }
}
async function updateAftercarePlan(id, data) {
    return prisma_1.prisma.aftercarePlan.update({
        where: { id },
        data: data,
        include: { steps: { orderBy: { order: 'asc' } } },
    });
}
async function deleteAftercarePlan(id) {
    return prisma_1.prisma.aftercarePlan.delete({ where: { id } });
}
