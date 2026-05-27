import { z } from 'zod';
import {
  shortText,
  optionalText,
  noteText,
  optionalPositiveDecimal,
  optionalCuid,
  cuid,
} from '../../../common/validation/common';

const CURRENCIES = ['UAH', 'USD', 'EUR'] as const;

const dealBase = {
  title: shortText(150),
  stage: optionalText(80),
  amount: optionalPositiveDecimal,
  commission: z.number().finite().min(0).max(100).optional().nullable(),
  currency: z.enum(CURRENCIES).optional(),
  notes: noteText(),
  leadId: optionalCuid,
  propertyId: optionalCuid,
  assignedToId: optionalCuid,
};

export const createDealSchema = z.object(dealBase).strict();

export const updateDealSchema = z
  .object({ ...dealBase, title: shortText(150).optional() })
  .strict();

export const convertLeadToDealSchema = z
  .object({
    title: shortText(150).optional(),
    stage: optionalText(80),
    amount: optionalPositiveDecimal,
    currency: z.enum(CURRENCIES).optional(),
  })
  .strict();

// ── Comments ──────────────────────────────────────────────────────────────────

export const addDealCommentSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, 'Required')
      .max(2000, 'Max 2000 chars')
      .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
  })
  .strict();

// ── Checklist ─────────────────────────────────────────────────────────────────

export const addChecklistItemSchema = z
  .object({ title: shortText(200) })
  .strict();

export const updateChecklistItemSchema = z
  .object({
    id: cuid,
    title: shortText(200).optional(),
    completed: z.boolean().optional(),
  })
  .strict();

// ── Custom field value ────────────────────────────────────────────────────────

export const saveCustomFieldValueSchema = z
  .object({
    dealId: cuid,
    fieldId: cuid,
    value: z.union([z.string().trim().max(2000), z.number().finite(), z.boolean(), z.null()]),
  })
  .strict();

// ── Funnel stages ─────────────────────────────────────────────────────────────

export const addFunnelStageSchema = z
  .object({
    label: shortText(80),
    value: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, digits, _ and - allowed'),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be hex color like #AABBCC'),
    order: z.number().int().min(0).optional(),
  })
  .strict();

export const updateFunnelStagesSchema = z
  .object({
    stages: z
      .array(
        z.object({
          id: cuid,
          label: shortText(80).optional(),
          color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
          order: z.number().int().min(0).optional(),
        }),
      )
      .min(1),
  })
  .strict();

// ── Deal custom fields ────────────────────────────────────────────────────────

const FIELD_TYPES = ['text', 'number', 'date', 'select', 'checkbox'] as const;

export const addDealCustomFieldSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, digits and _ allowed'),
    label: shortText(80),
    fieldType: z.enum(FIELD_TYPES),
    options: z.array(z.string().trim().max(100)).max(50).optional(),
  })
  .strict();

export const updateDealCustomFieldsSchema = z
  .object({
    fields: z
      .array(
        z.object({
          id: cuid,
          label: shortText(80).optional(),
          options: z.array(z.string().trim().max(100)).max(50).optional(),
          order: z.number().int().min(0).optional(),
        }),
      )
      .min(1),
  })
  .strict();
