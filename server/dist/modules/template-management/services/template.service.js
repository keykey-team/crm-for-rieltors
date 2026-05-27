"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTemplates = listTemplates;
exports.addTemplate = addTemplate;
exports.changeTemplate = changeTemplate;
exports.removeTemplate = removeTemplate;
const template_repository_1 = require("../repositories/template.repository");
async function listTemplates(type) {
    return (0, template_repository_1.findTemplates)(type);
}
async function addTemplate(userId, input) {
    return (0, template_repository_1.createTemplate)({
        name: input.name,
        type: input.type ?? 'message',
        category: input.category ?? 'general',
        content: input.content,
        variables: input.variables ?? null,
        createdById: userId ?? null,
    });
}
async function changeTemplate(id, input) {
    return (0, template_repository_1.updateTemplate)(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.variables !== undefined ? { variables: input.variables } : {}),
    });
}
async function removeTemplate(id) {
    await (0, template_repository_1.deleteTemplate)(id);
    return { success: true };
}
