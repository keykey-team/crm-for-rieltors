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
const DEAL_TYPES = ['sale', 'rent'] as const;

function emptyStringToUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;
  return value;
}

const dealOptionalDecimal = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, optionalPositiveDecimal);

const dealOptionalPercentage = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, z.number().finite().min(0).max(100).optional().nullable());

const dealOptionalId = z.preprocess((value) => emptyStringToUndefined(value), optionalCuid);

const dealBase = {
  title: shortText(150),
  stage: optionalText(80),
  dealType: z.enum(DEAL_TYPES).optional(),
  funnelId: dealOptionalId,
  amount: dealOptionalDecimal,
  commission: dealOptionalPercentage,
  currency: z.enum(CURRENCIES).optional(),
  notes: noteText(),
  leadId: dealOptionalId,
  propertyId: dealOptionalId,
  assignedToId: dealOptionalId,
};

export const createDealSchema = z.object(dealBase).strict();

export const updateDealSchema = z
  .object({ ...dealBase, title: shortText(150).optional() })
  .strict();

export const convertLeadToDealSchema = z
  .object({
    title: shortText(150).optional(),
    stage: optionalText(80),
    dealType: z.enum(DEAL_TYPES).optional(),
    funnelId: dealOptionalId,
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

// ── Funnels ───────────────────────────────────────────────────────────────────

export const createFunnelSchema = z
  .object({ name: shortText(80) })
  .strict();

export const updateFunnelSchema = z
  .object({ name: shortText(80) })
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
    funnelId: optionalCuid,
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
