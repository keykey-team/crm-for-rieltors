import { z } from 'zod';
import { shortText, noteText, cuid } from '../../../common/validation/common';

const STEP_TYPES = ['call', 'email', 'meeting', 'task', 'note', 'other'] as const;

const stepSchema = z.object({
  dayOffset: z.number().int().min(0, 'Must be >= 0'),
  type: z.enum(STEP_TYPES),
  title: shortText(150),
  content: noteText(),
  order: z.number().int().min(0).optional(),
});

const planBase = {
  name: shortText(120),
  description: noteText(),
  steps: z.array(stepSchema).max(50).optional(),
};

export const createAftercarePlanSchema = z.object(planBase).strict();
export const updateAftercarePlanSchema = z.object(planBase).partial().strict();

export const reorderAftercarePlansSchema = z
  .object({
    order: z.array(cuid).min(1).max(200),
  })
  .strict();
