"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserCredentialsByEmail = findUserCredentialsByEmail;
exports.findPublicUserById = findPublicUserById;
exports.findUserIdByEmail = findUserIdByEmail;
exports.createUser = createUser;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    accountType: true,
    plan: true,
    permissions: true,
};
async function findUserCredentialsByEmail(email) {
    return prisma_1.prisma.user.findUnique({
        where: { email },
        select: { ...publicUserSelect, password: true },
    });
}
async function findPublicUserById(id) {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: publicUserSelect,
    });
}
async function findUserIdByEmail(email) {
    return prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
}
async function createUser(data) {
    return prisma_1.prisma.user.create({
        data,
        select: { id: true, email: true },
    });
}
