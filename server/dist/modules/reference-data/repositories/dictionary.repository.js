"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveDictionaries = findActiveDictionaries;
exports.createDictionary = createDictionary;
exports.updateDictionary = updateDictionary;
exports.updateDictionaryOrder = updateDictionaryOrder;
exports.deactivateDictionary = deactivateDictionary;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findActiveDictionaries(category) {
    return prisma_1.prisma.dictionary.findMany({
        where: { isActive: true, ...(category ? { category } : {}) },
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
}
async function createDictionary(data) {
    return prisma_1.prisma.dictionary.create({ data: data });
}
async function updateDictionary(id, data) {
    return prisma_1.prisma.dictionary.update({ where: { id }, data: data });
}
async function updateDictionaryOrder(items) {
    await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.dictionary.update({
        where: { id: item.id },
        data: { order: item.order },
    })));
}
async function deactivateDictionary(id) {
    return prisma_1.prisma.dictionary.update({ where: { id }, data: { isActive: false } });
}
