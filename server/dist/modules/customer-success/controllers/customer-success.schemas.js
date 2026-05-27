"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderAftercarePlansSchema = exports.updateAftercarePlanSchema = exports.createAftercarePlanSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const STEP_TYPES = ['call', 'email', 'meeting', 'task', 'note', 'other'];
const stepSchema = zod_1.z.object({
    dayOffset: zod_1.z.number().int().min(0, 'Must be >= 0'),
    type: zod_1.z.enum(STEP_TYPES),
    title: (0, common_1.shortText)(150),
    content: (0, common_1.noteText)(),
    order: zod_1.z.number().int().min(0).optional(),
});
const planBase = {
    name: (0, common_1.shortText)(120),
    description: (0, common_1.noteText)(),
    steps: zod_1.z.array(stepSchema).max(50).optional(),
};
exports.createAftercarePlanSchema = zod_1.z.object(planBase).strict();
exports.updateAftercarePlanSchema = zod_1.z.object(planBase).partial().strict();
exports.reorderAftercarePlansSchema = zod_1.z
    .object({
    order: zod_1.z.array(common_1.cuid).min(1).max(200),
})
    .strict();
