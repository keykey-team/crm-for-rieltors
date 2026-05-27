"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexColor = exports.optionalUrl = exports.password = exports.isoDate = exports.optionalPositiveInt = exports.positiveInt = exports.optionalPositiveDecimal = exports.positiveDecimal = exports.optionalPhone = exports.phone = exports.optionalEmail = exports.email = exports.optionalCuid = exports.cuid = exports.longContent = exports.noteText = exports.optionalText = exports.shortText = void 0;
const zod_1 = require("zod");
// ── Строки ──────────────────────────────────────────────────────────────────
const shortText = (max = 120) => zod_1.z.string().trim().min(1, 'Required').max(max, `Max ${max} chars`);
exports.shortText = shortText;
const optionalText = (max = 120) => zod_1.z.string().trim().max(max, `Max ${max} chars`).optional();
exports.optionalText = optionalText;
const noteText = (max = 2000) => zod_1.z.string().trim().max(max, `Max ${max} chars`).optional();
exports.noteText = noteText;
const longContent = (max = 10000) => zod_1.z.string().trim().min(1, 'Required').max(max, `Max ${max} chars`);
exports.longContent = longContent;
// ── Идентификаторы ───────────────────────────────────────────────────────────
exports.cuid = zod_1.z.string().trim().min(1, 'Required');
exports.optionalCuid = zod_1.z.string().trim().min(1).optional().nullable();
// ── Email / Phone ────────────────────────────────────────────────────────────
exports.email = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Required')
    .max(254, 'Max 254 chars')
    .email('Invalid email format');
exports.optionalEmail = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email('Invalid email format')
    .optional()
    .or(zod_1.z.literal(''));
exports.phone = zod_1.z
    .string()
    .trim()
    .min(1, 'Required')
    .max(20, 'Max 20 chars')
    .regex(/^[+\d\s\-().]{1,20}$/, 'Invalid phone format');
exports.optionalPhone = zod_1.z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s\-().]{0,20}$/, 'Invalid phone format')
    .optional()
    .or(zod_1.z.literal(''));
// ── Числа ────────────────────────────────────────────────────────────────────
exports.positiveDecimal = zod_1.z
    .number()
    .finite()
    .min(0, 'Must be >= 0');
exports.optionalPositiveDecimal = exports.positiveDecimal.optional().nullable();
exports.positiveInt = zod_1.z
    .number()
    .int()
    .min(0, 'Must be >= 0');
exports.optionalPositiveInt = exports.positiveInt.optional().nullable();
// ── Дата ─────────────────────────────────────────────────────────────────────
exports.isoDate = zod_1.z
    .string()
    .trim()
    .datetime({ offset: true, message: 'Invalid ISO date' })
    .optional()
    .nullable();
// ── Пароль ───────────────────────────────────────────────────────────────────
exports.password = zod_1.z
    .string()
    .min(8, 'Min 8 characters')
    .max(72, 'Max 72 characters');
// ── URL ──────────────────────────────────────────────────────────────────────
exports.optionalUrl = zod_1.z
    .string()
    .trim()
    .url('Invalid URL')
    .refine((v) => /^https?:\/\//i.test(v), 'Only http/https URLs allowed')
    .optional()
    .or(zod_1.z.literal(''));
// ── Hex-цвет ─────────────────────────────────────────────────────────────────
exports.hexColor = zod_1.z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color like #AABBCC');
