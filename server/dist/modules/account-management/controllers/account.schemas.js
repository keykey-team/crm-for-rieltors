"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePlanSchema = exports.updateBrandSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
// ── Profile ───────────────────────────────────────────────────────────────────
exports.updateProfileSchema = zod_1.z
    .object({
    name: (0, common_1.shortText)(100).optional(),
    phone: common_1.optionalPhone,
    newPassword: common_1.password.optional(),
    avatar: zod_1.z
        .string()
        .trim()
        .max(500)
        .regex(/^[\w\-./]+$/, 'Invalid file path')
        .optional()
        .or(zod_1.z.literal('')),
    telegramUrl: common_1.optionalUrl,
})
    .strict();
// ── Brand ─────────────────────────────────────────────────────────────────────
exports.updateBrandSchema = zod_1.z
    .object({
    brandName: (0, common_1.optionalText)(120),
    brandLogo: zod_1.z
        .string()
        .trim()
        .max(500)
        .optional()
        .or(zod_1.z.literal('')),
    themeMode: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    sidebarGlass: zod_1.z.boolean().optional(),
    sidebarOpacity: zod_1.z.number().min(0.3).max(1).optional(),
    gradientBg: zod_1.z.boolean().optional(),
})
    .strict();
// ── Plan ──────────────────────────────────────────────────────────────────────
exports.changePlanSchema = zod_1.z
    .object({
    plan: zod_1.z.enum(['free', 'pro', 'enterprise']),
})
    .strict();
