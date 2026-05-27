"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAutomations = listAutomations;
exports.addAutomation = addAutomation;
exports.changeAutomation = changeAutomation;
exports.removeAutomation = removeAutomation;
const automation_repository_1 = require("../repositories/automation.repository");
async function listAutomations() {
    return (0, automation_repository_1.findAutomations)();
}
async function addAutomation(userId, input) {
    return (0, automation_repository_1.createAutomation)({
        name: input.name,
        description: input.description ?? null,
        trigger: input.trigger,
        triggerValue: input.triggerValue ?? null,
        action: input.action,
        actionValue: input.actionValue ?? null,
        isActive: input.isActive ?? true,
        createdById: userId ?? null,
    });
}
async function changeAutomation(id, input) {
    return (0, automation_repository_1.updateAutomation)(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.trigger !== undefined ? { trigger: input.trigger } : {}),
        ...(input.triggerValue !== undefined ? { triggerValue: input.triggerValue } : {}),
        ...(input.action !== undefined ? { action: input.action } : {}),
        ...(input.actionValue !== undefined ? { actionValue: input.actionValue } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
}
async function removeAutomation(id) {
    await (0, automation_repository_1.deleteAutomation)(id);
    return { success: true };
}
