"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const TASK_TYPES = ['call', 'meeting', 'email', 'follow_up', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
const taskBase = {
    title: (0, common_1.shortText)(150),
    description: (0, common_1.noteText)(),
    type: zod_1.z.enum(TASK_TYPES).optional(),
    priority: zod_1.z.enum(PRIORITIES).optional(),
    dueDate: common_1.isoDate,
};
exports.createTaskSchema = zod_1.z.object(taskBase).strict();
exports.updateTaskSchema = zod_1.z
    .object({ ...taskBase, title: (0, common_1.shortText)(150).optional() })
    .strict();
