import { z } from 'zod';
import { shortText, optionalText } from '../../../common/validation/common';

const TRIGGERS = ['lead_created', 'lead_status_changed', 'deal_created', 'deal_stage_changed', 'task_overdue'] as const;
const ACTIONS = ['assign_lead', 'change_lead_status', 'create_task', 'send_notification', 'move_deal_stage'] as const;

const automationBase = {
  name: shortText(120),
  description: optionalText(255),
  trigger: z.enum(TRIGGERS),
  triggerValue: z.string().trim().max(255).optional(),
  action: z.enum(ACTIONS),
  actionValue: z.string().trim().max(255).optional(),
};

export const createAutomationSchema = z.object(automationBase).strict();
export const updateAutomationSchema = z.object(automationBase).partial().strict();
