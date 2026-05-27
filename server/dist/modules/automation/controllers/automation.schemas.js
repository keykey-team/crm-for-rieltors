"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAutomationSchema = exports.createAutomationSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const TRIGGERS = ['lead_created', 'lead_status_changed', 'deal_created', 'deal_stage_changed', 'task_overdue'];
const ACTIONS = ['assign_lead', 'change_lead_status', 'create_task', 'send_notification', 'move_deal_stage'];
const automationBase = {
    name: (0, common_1.shortText)(120),
    description: (0, common_1.optionalText)(255),
    trigger: zod_1.z.enum(TRIGGERS),
    triggerValue: zod_1.z.string().trim().max(255).optional(),
    action: zod_1.z.enum(ACTIONS),
    actionValue: zod_1.z.string().trim().max(255).optional(),
};
exports.createAutomationSchema = zod_1.z.object(automationBase).strict();
exports.updateAutomationSchema = zod_1.z.object(automationBase).partial().strict();
