"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArticleSchema = exports.createArticleSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const KB_CATEGORIES = ['general', 'sales', 'property', 'legal', 'faq', 'other'];
const articleBase = {
    title: (0, common_1.shortText)(160),
    category: zod_1.z.enum(KB_CATEGORIES).optional(),
    content: (0, common_1.longContent)(30000),
};
exports.createArticleSchema = zod_1.z.object(articleBase).strict();
exports.updateArticleSchema = zod_1.z.object(articleBase).partial().strict();
