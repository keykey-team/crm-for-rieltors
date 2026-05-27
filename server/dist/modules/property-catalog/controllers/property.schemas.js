"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertyUnitSchema = exports.createPropertyUnitSchema = exports.updatePropertySchema = exports.createPropertySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const PROPERTY_TYPES = ['apartment', 'house', 'commercial', 'land', 'garage', 'other'];
const PROPERTY_STATUSES = ['active', 'available', 'reserved', 'sold', 'rented', 'inactive'];
const PROPERTY_DEAL_TYPES = ['sale', 'rent'];
const CURRENCIES = ['UAH', 'USD', 'EUR'];
const UNIT_STATUSES = ['available', 'reserved', 'sold'];
function emptyStringToUndefined(value) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value === 'string' && !value.trim())
        return undefined;
    return value;
}
const propertyOptionalInt = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, common_1.optionalPositiveInt);
const propertyOptionalDecimal = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined)
        return undefined;
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, common_1.optionalPositiveDecimal);
const propertyRequiredDecimal = zod_1.z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (typeof normalized === 'string') {
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : normalized;
    }
    return normalized;
}, common_1.positiveDecimal);
const propertyDealTypes = zod_1.z.preprocess((value) => {
    if (value === null || value === undefined)
        return undefined;
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof value === 'string' && value.trim())
        return [value.trim()];
    return value;
}, zod_1.z.array(zod_1.z.enum(PROPERTY_DEAL_TYPES)).min(1).optional());
// ── Property ──────────────────────────────────────────────────────────────────
const propertyBase = {
    title: (0, common_1.shortText)(150),
    type: zod_1.z.enum(PROPERTY_TYPES).optional(),
    status: zod_1.z.enum(PROPERTY_STATUSES).optional(),
    address: (0, common_1.shortText)(250),
    district: (0, common_1.optionalText)(100),
    city: (0, common_1.optionalText)(100),
    rooms: propertyOptionalInt,
    area: propertyOptionalDecimal,
    floor: propertyOptionalInt,
    totalFloors: propertyOptionalInt,
    price: propertyRequiredDecimal,
    currency: zod_1.z.enum(CURRENCIES).optional(),
    dealTypes: propertyDealTypes,
    description: zod_1.z.string().trim().max(3000).optional(),
};
exports.createPropertySchema = zod_1.z
    .object(propertyBase)
    .strict()
    .refine((d) => d.floor == null || d.totalFloors == null || d.floor <= d.totalFloors, { message: 'floor must be <= totalFloors', path: ['floor'] });
exports.updatePropertySchema = zod_1.z
    .object({
    ...propertyBase,
    title: (0, common_1.shortText)(150).optional(),
    address: (0, common_1.shortText)(250).optional(),
    price: propertyOptionalDecimal,
})
    .strict()
    .refine((d) => d.floor == null || d.totalFloors == null || d.floor <= d.totalFloors, { message: 'floor must be <= totalFloors', path: ['floor'] });
// ── Property unit ─────────────────────────────────────────────────────────────
exports.createPropertyUnitSchema = zod_1.z
    .object({
    propertyId: common_1.cuid,
    unitNumber: (0, common_1.shortText)(50),
    floor: zod_1.z.number().int().min(0),
    section: (0, common_1.optionalText)(50),
    rooms: common_1.optionalPositiveInt,
    area: common_1.optionalPositiveDecimal,
    price: common_1.optionalPositiveDecimal,
    status: zod_1.z.enum(UNIT_STATUSES).optional(),
})
    .strict();
exports.updatePropertyUnitSchema = zod_1.z
    .object({
    id: common_1.cuid,
    unitNumber: (0, common_1.shortText)(50).optional(),
    floor: zod_1.z.number().int().min(0).optional(),
    section: (0, common_1.optionalText)(50),
    rooms: common_1.optionalPositiveInt,
    area: common_1.optionalPositiveDecimal,
    price: common_1.optionalPositiveDecimal,
    status: zod_1.z.enum(UNIT_STATUSES).optional(),
})
    .strict();
