"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFunnelStages = findFunnelStages;
exports.createFunnelStage = createFunnelStage;
exports.updateFunnelStage = updateFunnelStage;
exports.updateFunnelStageOrder = updateFunnelStageOrder;
exports.findFunnelStage = findFunnelStage;
exports.deactivateFunnelStage = deactivateFunnelStage;
exports.findDealCustomFields = findDealCustomFields;
exports.createDealCustomField = createDealCustomField;
exports.updateDealCustomField = updateDealCustomField;
exports.updateDealCustomFieldOrder = updateDealCustomFieldOrder;
exports.deactivateDealCustomField = deactivateDealCustomField;
exports.findDealCustomFieldValues = findDealCustomFieldValues;
exports.upsertDealCustomFieldValue = upsertDealCustomFieldValue;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findFunnelStages() {
    return prisma_1.prisma.funnelStage.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
}
async function createFunnelStage(data) {
    const maxOrder = await prisma_1.prisma.funnelStage.aggregate({ _max: { order: true } });
    return prisma_1.prisma.funnelStage.create({ data: { ...data, order: (maxOrder._max.order ?? -1) + 1 } });
}
async function updateFunnelStage(id, data) {
    return prisma_1.prisma.funnelStage.update({ where: { id }, data: data });
}
async function updateFunnelStageOrder(items) {
    await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.funnelStage.update({ where: { id: item.id }, data: { order: item.order } })));
}
async function findFunnelStage(id) {
    return prisma_1.prisma.funnelStage.findUnique({ where: { id } });
}
async function deactivateFunnelStage(id) {
    return prisma_1.prisma.funnelStage.update({ where: { id }, data: { isActive: false } });
}
async function findDealCustomFields() {
    return prisma_1.prisma.dealCustomField.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
}
async function createDealCustomField(data) {
    return prisma_1.prisma.dealCustomField.create({ data: data });
}
async function updateDealCustomField(id, data) {
    return prisma_1.prisma.dealCustomField.update({ where: { id }, data: data });
}
async function updateDealCustomFieldOrder(items) {
    await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.dealCustomField.update({ where: { id: item.id }, data: { order: item.order } })));
}
async function deactivateDealCustomField(id) {
    return prisma_1.prisma.dealCustomField.update({ where: { id }, data: { isActive: false } });
}
async function findDealCustomFieldValues(dealId) {
    return prisma_1.prisma.dealCustomFieldValue.findMany({ where: { dealId }, include: { field: true } });
}
async function upsertDealCustomFieldValue(dealId, fieldId, value) {
    return prisma_1.prisma.dealCustomFieldValue.upsert({
        where: { dealId_fieldId: { dealId, fieldId } },
        update: { value },
        create: { dealId, fieldId, value },
    });
}
