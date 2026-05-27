"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
exports.signupSchema = zod_1.z
    .object({
    accountType: zod_1.z.enum(['agent', 'agency']),
    name: (0, common_1.shortText)(100),
    email: common_1.email,
    password: common_1.password,
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: common_1.email,
    password: zod_1.z.string().min(1, 'Required').max(128, 'Max 128 chars'),
})
    .strict();
