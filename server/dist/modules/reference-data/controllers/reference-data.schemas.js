"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDictionarySchema = exports.createDictionarySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const DICT_CATEGORIES = ['source', 'district', 'property_type', 'need_type', 'tag', 'other'];
const dictBase = {
    category: zod_1.z.enum(DICT_CATEGORIES),
    label: (0, common_1.shortText)(120),
    value: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, digits, _ and - allowed'),
    order: zod_1.z.number().int().min(0).optional(),
};
exports.createDictionarySchema = zod_1.z.object(dictBase).strict();
exports.updateDictionarySchema = zod_1.z
    .object({ id: common_1.cuid, ...dictBase })
    .partial()
    .required({ id: true })
    .strict();
