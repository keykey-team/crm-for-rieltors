import { z } from 'zod';
import { shortText, cuid } from '../../../common/validation/common';

const DICT_CATEGORIES = ['source', 'district', 'property_type', 'need_type', 'tag', 'other'] as const;

const dictBase = {
  category: z.enum(DICT_CATEGORIES),
  label: shortText(120),
  value: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, digits, _ and - allowed'),
  order: z.number().int().min(0).optional(),
};

export const createDictionarySchema = z.object(dictBase).strict();

export const updateDictionarySchema = z
  .object({ id: cuid, ...dictBase })
  .partial()
  .required({ id: true })
  .strict();
