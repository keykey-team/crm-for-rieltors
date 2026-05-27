"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_ROLES = void 0;
exports.isAdminRole = isAdminRole;
exports.ADMIN_ROLES = ['admin', 'director'];
function isAdminRole(role) {
    return Boolean(role && exports.ADMIN_ROLES.includes(role));
}
