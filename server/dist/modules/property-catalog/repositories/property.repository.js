"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProperties = findProperties;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
exports.findPropertyUnits = findPropertyUnits;
exports.createPropertyUnit = createPropertyUnit;
exports.updatePropertyUnit = updatePropertyUnit;
exports.deletePropertyUnit = deletePropertyUnit;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findProperties(where) {
    return prisma_1.prisma.property.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: 200,
    });
}
async function createProperty(data) {
    return prisma_1.prisma.property.create({ data: data });
}
async function updateProperty(id, data) {
    return prisma_1.prisma.property.update({ where: { id }, data: data });
}
async function deleteProperty(id) {
    return prisma_1.prisma.property.delete({ where: { id } });
}
async function findPropertyUnits(propertyId) {
    return prisma_1.prisma.propertyUnit.findMany({
        where: { propertyId },
        orderBy: [{ section: 'asc' }, { floor: 'desc' }, { unitNumber: 'asc' }],
    });
}
async function createPropertyUnit(data) {
    return prisma_1.prisma.propertyUnit.create({ data: data });
}
async function updatePropertyUnit(id, data) {
    return prisma_1.prisma.propertyUnit.update({ where: { id }, data: data });
}
async function deletePropertyUnit(id) {
    return prisma_1.prisma.propertyUnit.delete({ where: { id } });
}
