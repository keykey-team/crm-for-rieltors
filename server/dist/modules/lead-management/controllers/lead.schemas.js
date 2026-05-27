"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommunicationSchema = exports.updateDistributionRuleSchema = exports.createDistributionRuleSchema = exports.importLeadsSchema = exports.bulkLeadSchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const LEAD_SOURCES = ['manual', 'telegram', 'instagram', 'olx', 'dom_ria', 'website', 'referral', 'social', 'call', 'email', 'other'];
const NEED_TYPES = ['buy', 'rent', 'sell', 'invest', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
function emptyStringToUndefined(value) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value === 'string' && !value.trim())
        return undefined;
    return value;
}
const leadBudgetInput = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, common_1.optionalPositiveDecimal);
const leadAssignedToId = zod_1.z.preprocess(emptyStringToUndefined, common_1.optionalCuid);
const leadLastContact = zod_1.z.preprocess(emptyStringToUndefined, common_1.isoDate);
const leadBase = {
    firstName: (0, common_1.shortText)(100),
    lastName: (0, common_1.optionalText)(100),
    email: common_1.optionalEmail,
    phone: common_1.phone,
    source: zod_1.z.enum(LEAD_SOURCES).optional(),
    status: (0, common_1.optionalText)(80),
    needType: zod_1.z.enum(NEED_TYPES).optional(),
    priority: zod_1.z.enum(PRIORITIES).optional(),
    budget: leadBudgetInput,
    notes: (0, common_1.noteText)(),
    districts: (0, common_1.optionalText)(250),
    propertyType: (0, common_1.optionalText)(80),
    lastContact: leadLastContact,
    assignedToId: leadAssignedToId,
};
exports.createLeadSchema = zod_1.z.object(leadBase).strict();
exports.updateLeadSchema = zod_1.z
    .object({
    ...leadBase,
    firstName: (0, common_1.shortText)(100).optional(),
    phone: common_1.optionalPhone,
})
    .strict();
exports.bulkLeadSchema = zod_1.z
    .object({
    action: zod_1.z.enum(['delete', 'assign', 'status']),
    ids: zod_1.z.array(common_1.cuid).min(1).max(500),
    assignedToId: common_1.optionalCuid,
    value: (0, common_1.optionalText)(80),
})
    .strict();
exports.importLeadsSchema = zod_1.z
    .object({
    leads: zod_1.z
        .array(zod_1.z.object({
        firstName: (0, common_1.shortText)(100),
        lastName: (0, common_1.optionalText)(100),
        phone: common_1.optionalPhone,
        email: common_1.optionalEmail,
        source: zod_1.z.enum(LEAD_SOURCES).optional(),
    }))
        .min(1)
        .max(500),
})
    .strict();
// ── Lead distribution ─────────────────────────────────────────────────────────
exports.createDistributionRuleSchema = zod_1.z
    .object({
    name: (0, common_1.shortText)(120),
    source: zod_1.z.enum(LEAD_SOURCES).optional(),
    district: (0, common_1.optionalText)(100),
    propertyType: (0, common_1.optionalText)(80),
    needType: zod_1.z.enum(NEED_TYPES).optional(),
    assignToId: common_1.cuid,
    priority: zod_1.z.number().int().min(0).max(9999).optional(),
})
    .strict();
exports.updateDistributionRuleSchema = exports.createDistributionRuleSchema.partial().extend({
    id: common_1.cuid,
});
// ── Communication ─────────────────────────────────────────────────────────────
exports.createCommunicationSchema = zod_1.z
    .object({
    leadId: common_1.cuid,
    type: zod_1.z.enum(['call', 'email', 'meeting', 'note', 'sms', 'other']),
    direction: zod_1.z.enum(['inbound', 'outbound']).optional(),
    content: zod_1.z
        .string()
        .trim()
        .min(1, 'Required')
        .max(4000, 'Max 4000 chars')
        .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
})
    .strict();
