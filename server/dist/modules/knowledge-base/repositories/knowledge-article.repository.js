"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findArticles = findArticles;
exports.createArticle = createArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findArticles(filters) {
    const where = { published: true };
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { content: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.category)
        where.category = filters.category;
    return prisma_1.prisma.knowledgeArticle.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { author: { select: { id: true, name: true } } },
    });
}
async function createArticle(data) {
    return prisma_1.prisma.knowledgeArticle.create({ data: data });
}
async function updateArticle(id, data) {
    return prisma_1.prisma.knowledgeArticle.update({ where: { id }, data: data });
}
async function deleteArticle(id) {
    return prisma_1.prisma.knowledgeArticle.delete({ where: { id } });
}
