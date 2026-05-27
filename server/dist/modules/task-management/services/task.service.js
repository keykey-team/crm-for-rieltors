"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasks = listTasks;
exports.addTask = addTask;
exports.changeTask = changeTask;
exports.removeTask = removeTask;
const errors_1 = require("../../../common/shared-kernel/errors");
const roles_1 = require("../../../common/shared-kernel/roles");
const task_repository_1 = require("../repositories/task.repository");
function normalizeDueDate(value) {
    if (value === undefined)
        return undefined;
    if (value === '' || value === null)
        return null;
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime()))
        throw (0, errors_1.badRequest)('Invalid dueDate format');
    return parsed.toISOString();
}
function ownershipFilter(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
async function listTasks(query) {
    const where = ownershipFilter(query.role, query.userId);
    if (query.status)
        where.status = query.status;
    if (query.type)
        where.type = query.type;
    if (query.priority)
        where.priority = query.priority;
    return (0, task_repository_1.findTasks)(where);
}
async function addTask(userId, input) {
    const dueDate = normalizeDueDate(input.dueDate);
    return (0, task_repository_1.createTask)({
        ...input,
        ...(dueDate !== undefined ? { dueDate } : {}),
        assignedToId: input.assignedToId ?? userId ?? null,
    });
}
async function changeTask(id, input) {
    const dueDate = normalizeDueDate(input.dueDate);
    return (0, task_repository_1.updateTask)(id, {
        ...input,
        ...(dueDate !== undefined ? { dueDate } : {}),
    });
}
async function removeTask(id) {
    await (0, task_repository_1.deleteTask)(id);
    return { success: true };
}
