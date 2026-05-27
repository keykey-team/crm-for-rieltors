"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplateSchema = exports.createTemplateSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const TEMPLATE_TYPES = ['email', 'sms', 'note', 'other'];
const TEMPLATE_CATEGORIES = ['lead', 'deal', 'property', 'general'];
const templateBase = {
    name: (0, common_1.shortText)(120),
    type: zod_1.z.enum(TEMPLATE_TYPES),
    category: zod_1.z.enum(TEMPLATE_CATEGORIES).optional(),
    content: (0, common_1.longContent)(10000),
};
exports.createTemplateSchema = zod_1.z.object(templateBase).strict();
exports.updateTemplateSchema = zod_1.z.object(templateBase).partial().strict();
