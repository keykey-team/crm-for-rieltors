"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTasks = findTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findTasks(where) {
    return prisma_1.prisma.task.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: 300,
        include: {
            lead: { select: { id: true, firstName: true, lastName: true } },
        },
    });
}
async function createTask(data) {
    return prisma_1.prisma.task.create({ data: data });
}
async function updateTask(id, data) {
    return prisma_1.prisma.task.update({ where: { id }, data: data });
}
async function deleteTask(id) {
    return prisma_1.prisma.task.delete({ where: { id } });
}
