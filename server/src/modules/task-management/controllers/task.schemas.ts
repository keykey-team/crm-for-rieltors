import { z } from 'zod';
import { shortText, noteText, isoDate } from '../../../common/validation/common';

const TASK_TYPES = ['call', 'meeting', 'email', 'follow_up', 'other'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;

const taskBase = {
  title: shortText(150),
  description: noteText(),
  type: z.enum(TASK_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: isoDate,
};

export const createTaskSchema = z.object(taskBase).strict();

export const updateTaskSchema = z
  .object({ ...taskBase, title: shortText(150).optional() })
  .strict();
