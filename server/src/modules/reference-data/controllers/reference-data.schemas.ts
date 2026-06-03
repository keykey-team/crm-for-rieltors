import { z } from 'zod';
import { shortText, cuid } from '../../../common/validation/common';

const DICT_CATEGORIES = [
  'source',
  'lead_source',
  'district',
  'property_type',
  'property_status',
  'property_deal_type',
  'operation_type',
  'deal_status',
  'showing_status',
  'rejection_reason',
  'document_type',
  'repair_type',
  'layout_type',
  'real_estate_class',
  'wall_type',
  'heating_type',
  'currency',
  'object_source',
  'payment_condition',
  'commission_type',
  'commercial_purpose',
  'parking_type',
  'communication_type',
  'media_type',
  'publication_channel',
  'publication_status',
  'need_type',
  'tag',
  'other',
] as const;

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
  isActive: z.boolean().optional(),
};

export const createDictionarySchema = z.object(dictBase).strict();

const updateItemSchema = z
  .object({ id: cuid, ...dictBase })
  .partial()
  .required({ id: true })
  .strict();

const reorderSchema = z
  .object({
    items: z.array(z.object({ id: cuid, order: z.number().int().min(0) })).min(1),
  })
  .strict();

export const updateDictionarySchema = z.union([updateItemSchema, reorderSchema]);
