"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findManagedUsers = findManagedUsers;
exports.createManagedUser = createManagedUser;
exports.updateManagedUser = updateManagedUser;
exports.deleteManagedUser = deleteManagedUser;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
const managedUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    permissions: true,
    createdAt: true,
};
async function findManagedUsers() {
    return prisma_1.prisma.user.findMany({
        select: managedUserSelect,
        orderBy: { createdAt: 'desc' },
    });
}
async function createManagedUser(data) {
    return prisma_1.prisma.user.create({
        data: data,
        select: managedUserSelect,
    });
}
async function updateManagedUser(id, data) {
    return prisma_1.prisma.user.update({
        where: { id },
        data: data,
        select: managedUserSelect,
    });
}
async function deleteManagedUser(id) {
    return prisma_1.prisma.user.delete({ where: { id } });
}
