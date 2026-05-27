"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const ROLES = ['admin', 'director', 'agent'];
const userBase = {
    name: (0, common_1.shortText)(100),
    email: common_1.email,
    role: zod_1.z.enum(ROLES),
    phone: common_1.optionalPhone,
};
exports.createUserSchema = zod_1.z
    .object({ ...userBase, password: common_1.password })
    .strict();
exports.updateUserSchema = zod_1.z
    .object({
    ...userBase,
    name: (0, common_1.shortText)(100).optional(),
    email: common_1.email.optional(),
    role: zod_1.z.enum(ROLES).optional(),
    password: common_1.password.optional(),
})
    .strict();
