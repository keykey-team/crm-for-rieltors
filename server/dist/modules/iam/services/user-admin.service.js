"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.addUser = addUser;
exports.changeUser = changeUser;
exports.removeUser = removeUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("../../../common/shared-kernel/errors");
const roles_1 = require("../../../common/shared-kernel/roles");
const user_admin_repository_1 = require("../repositories/user-admin.repository");
function assertCanManageUsers(role) {
    if (!(0, roles_1.isAdminRole)(role))
        throw (0, errors_1.forbidden)();
}
async function listUsers() {
    return (0, user_admin_repository_1.findManagedUsers)();
}
async function addUser(input, role) {
    assertCanManageUsers(role);
    return (0, user_admin_repository_1.createManagedUser)({
        name: input.name,
        email: input.email,
        password: await bcryptjs_1.default.hash(String(input.password ?? ''), 12),
        role: input.role ?? 'agent',
        phone: input.phone ?? null,
        permissions: input.permissions ?? null,
    });
}
async function changeUser(id, input, role) {
    assertCanManageUsers(role);
    return (0, user_admin_repository_1.updateManagedUser)(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.permissions !== undefined ? { permissions: input.permissions } : {}),
    });
}
async function removeUser(id, role) {
    assertCanManageUsers(role);
    await (0, user_admin_repository_1.deleteManagedUser)(id);
    return { success: true };
}
