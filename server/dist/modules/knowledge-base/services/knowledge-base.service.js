"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listArticles = listArticles;
exports.addArticle = addArticle;
exports.changeArticle = changeArticle;
exports.removeArticle = removeArticle;
const knowledge_article_repository_1 = require("../repositories/knowledge-article.repository");
async function listArticles(filters) {
    return (0, knowledge_article_repository_1.findArticles)(filters);
}
async function addArticle(userId, input) {
    return (0, knowledge_article_repository_1.createArticle)({
        title: input.title,
        content: input.content,
        category: input.category ?? 'general',
        authorId: userId ?? null,
    });
}
async function changeArticle(id, input) {
    return (0, knowledge_article_repository_1.updateArticle)(id, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.published !== undefined ? { published: input.published } : {}),
    });
}
async function removeArticle(id) {
    await (0, knowledge_article_repository_1.deleteArticle)(id);
    return { success: true };
}
