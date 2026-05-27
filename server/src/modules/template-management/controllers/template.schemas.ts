import { z } from 'zod';
import { shortText, longContent } from '../../../common/validation/common';

const TEMPLATE_TYPES = ['email', 'sms', 'note', 'other'] as const;
const TEMPLATE_CATEGORIES = ['lead', 'deal', 'property', 'general'] as const;

const templateBase = {
  name: shortText(120),
  type: z.enum(TEMPLATE_TYPES),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  content: longContent(10000),
};

export const createTemplateSchema = z.object(templateBase).strict();
export const updateTemplateSchema = z.object(templateBase).partial().strict();
