"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDealCustomFieldsSchema = exports.addDealCustomFieldSchema = exports.updateFunnelStagesSchema = exports.addFunnelStageSchema = exports.updateFunnelSchema = exports.createFunnelSchema = exports.saveCustomFieldValueSchema = exports.updateChecklistItemSchema = exports.addChecklistItemSchema = exports.addDealCommentSchema = exports.convertLeadToDealSchema = exports.updateDealSchema = exports.createDealSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const CURRENCIES = ['UAH', 'USD', 'EUR'];
const DEAL_TYPES = ['sale', 'rent'];
function emptyStringToUndefined(value) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value === 'string' && !value.trim())
        return undefined;
    return value;
}
const dealOptionalDecimal = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, common_1.optionalPositiveDecimal);
const dealOptionalPercentage = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, zod_1.z.number().finite().min(0).max(100).optional().nullable());
const dealOptionalId = zod_1.z.preprocess((value) => emptyStringToUndefined(value), common_1.optionalCuid);
const dealBase = {
    title: (0, common_1.shortText)(150),
    stage: (0, common_1.optionalText)(80),
    dealType: zod_1.z.enum(DEAL_TYPES).optional(),
    funnelId: dealOptionalId,
    amount: dealOptionalDecimal,
    commission: dealOptionalPercentage,
    currency: zod_1.z.enum(CURRENCIES).optional(),
    notes: (0, common_1.noteText)(),
    leadId: dealOptionalId,
    propertyId: dealOptionalId,
    assignedToId: dealOptionalId,
};
exports.createDealSchema = zod_1.z.object(dealBase).strict();
exports.updateDealSchema = zod_1.z
    .object({ ...dealBase, title: (0, common_1.shortText)(150).optional() })
    .strict();
exports.convertLeadToDealSchema = zod_1.z
    .object({
    title: (0, common_1.shortText)(150).optional(),
    stage: (0, common_1.optionalText)(80),
    dealType: zod_1.z.enum(DEAL_TYPES).optional(),
    funnelId: dealOptionalId,
    amount: common_1.optionalPositiveDecimal,
    currency: zod_1.z.enum(CURRENCIES).optional(),
})
    .strict();
// ── Comments ──────────────────────────────────────────────────────────────────
exports.addDealCommentSchema = zod_1.z
    .object({
    text: zod_1.z
        .string()
        .trim()
        .min(1, 'Required')
        .max(2000, 'Max 2000 chars')
        .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
})
    .strict();
// ── Checklist ─────────────────────────────────────────────────────────────────
exports.addChecklistItemSchema = zod_1.z
    .object({ title: (0, common_1.shortText)(200) })
    .strict();
exports.updateChecklistItemSchema = zod_1.z
    .object({
    id: common_1.cuid,
    title: (0, common_1.shortText)(200).optional(),
    completed: zod_1.z.boolean().optional(),
})
    .strict();
// ── Custom field value ────────────────────────────────────────────────────────
exports.saveCustomFieldValueSchema = zod_1.z
    .object({
    dealId: common_1.cuid,
    fieldId: common_1.cuid,
    value: zod_1.z.union([zod_1.z.string().trim().max(2000), zod_1.z.number().finite(), zod_1.z.boolean(), zod_1.z.null()]),
})
    .strict();
// ── Funnels ───────────────────────────────────────────────────────────────────
exports.createFunnelSchema = zod_1.z
    .object({ name: (0, common_1.shortText)(80) })
    .strict();
exports.updateFunnelSchema = zod_1.z
    .object({ name: (0, common_1.shortText)(80) })
    .strict();
// ── Funnel stages ─────────────────────────────────────────────────────────────
exports.addFunnelStageSchema = zod_1.z
    .object({
    label: (0, common_1.shortText)(80),
    value: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, digits, _ and - allowed'),
    color: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be hex color like #AABBCC'),
    order: zod_1.z.number().int().min(0).optional(),
    funnelId: common_1.optionalCuid,
})
    .strict();
exports.updateFunnelStagesSchema = zod_1.z
    .object({
    stages: zod_1.z
        .array(zod_1.z.object({
        id: common_1.cuid,
        label: (0, common_1.shortText)(80).optional(),
        color: zod_1.z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        order: zod_1.z.number().int().min(0).optional(),
    }))
        .min(1),
})
    .strict();
// ── Deal custom fields ────────────────────────────────────────────────────────
const FIELD_TYPES = ['text', 'number', 'date', 'select', 'checkbox'];
exports.addDealCustomFieldSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, digits and _ allowed'),
    label: (0, common_1.shortText)(80),
    fieldType: zod_1.z.enum(FIELD_TYPES),
    options: zod_1.z.array(zod_1.z.string().trim().max(100)).max(50).optional(),
})
    .strict();
exports.updateDealCustomFieldsSchema = zod_1.z
    .object({
    fields: zod_1.z
        .array(zod_1.z.object({
        id: common_1.cuid,
        label: (0, common_1.shortText)(80).optional(),
        options: zod_1.z.array(zod_1.z.string().trim().max(100)).max(50).optional(),
        order: zod_1.z.number().int().min(0).optional(),
    }))
        .min(1),
})
    .strict();
