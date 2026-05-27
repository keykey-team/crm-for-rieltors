"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicatesQuerySchema = exports.updateShowingSchema = exports.createShowingSchema = exports.listShowingsQuerySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const SHOWING_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];
function emptyStringToUndefined(value) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value === 'string' && !value.trim())
        return undefined;
    return value;
}
const optionalId = zod_1.z.preprocess((value) => emptyStringToUndefined(value), common_1.optionalCuid);
const optionalDate = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (!normalized)
        return undefined;
    return typeof normalized === 'string' ? new Date(normalized) : normalized;
}, zod_1.z.date().optional());
const optionalInt = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, zod_1.z.number().int().min(1).optional());
exports.listShowingsQuerySchema = zod_1.z.object({
    dealId: optionalId,
    propertyId: optionalId,
    leadId: optionalId,
    agentId: optionalId,
    status: zod_1.z.enum(SHOWING_STATUSES).optional(),
    from: optionalDate,
    to: optionalDate,
    page: optionalInt,
    limit: optionalInt,
}).strict();
exports.createShowingSchema = zod_1.z.object({
    dealId: optionalId,
    propertyId: zod_1.z.string().trim().min(1, 'Required'),
    leadId: optionalId,
    agentId: optionalId,
    scheduledAt: zod_1.z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), zod_1.z.date()),
    durationMin: zod_1.z.preprocess((value) => {
        if (value === undefined || value === null || value === '')
            return 30;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }, zod_1.z.number().int().min(5).max(1440).default(30)),
    status: zod_1.z.enum(SHOWING_STATUSES).optional(),
    feedback: (0, common_1.noteText)(),
    clientRating: zod_1.z.preprocess((value) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }, zod_1.z.number().int().min(1).max(5).optional()),
    agentNotes: (0, common_1.noteText)(),
    createEvent: zod_1.z.boolean().optional(),
}).strict();
exports.updateShowingSchema = zod_1.z.object({
    dealId: optionalId,
    propertyId: optionalId,
    leadId: optionalId,
    agentId: optionalId,
    scheduledAt: optionalDate,
    durationMin: zod_1.z.preprocess((value) => {
        const normalized = emptyStringToUndefined(value);
        if (normalized === undefined)
            return undefined;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }, zod_1.z.number().int().min(5).max(1440).optional()),
    status: zod_1.z.enum(SHOWING_STATUSES).optional(),
    feedback: (0, common_1.noteText)(),
    clientRating: zod_1.z.preprocess((value) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }, zod_1.z.number().int().min(1).max(5).optional()),
    agentNotes: (0, common_1.noteText)(),
}).strict().refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field is required' });
exports.duplicatesQuerySchema = zod_1.z.object({
    propertyId: zod_1.z.string().trim().min(1, 'Required'),
    leadId: zod_1.z.string().trim().min(1, 'Required'),
}).strict();
