"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamFacade = void 0;
const roles_1 = require("../../../common/shared-kernel/roles");
const user_repository_1 = require("../repositories/user.repository");
exports.iamFacade = {
    getPublicUser: user_repository_1.findPublicUserById,
    canViewWorkspaceData(role) {
        return (0, roles_1.isAdminRole)(role);
    },
};
