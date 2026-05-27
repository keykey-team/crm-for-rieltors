import { z } from 'zod';
import {
  shortText,
  optionalText,
  noteText,
  optionalEmail,
  optionalPhone,
  phone,
  optionalPositiveDecimal,
  optionalCuid,
  cuid,
} from '../../../common/validation/common';

const LEAD_SOURCES = ['website', 'referral', 'social', 'call', 'email', 'other'] as const;
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost', 'converted'] as const;
const NEED_TYPES = ['buy', 'rent', 'sell', 'invest', 'other'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;

const leadBase = {
  firstName: shortText(100),
  lastName: optionalText(100),
  email: optionalEmail,
  phone,
  source: z.enum(LEAD_SOURCES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  needType: z.enum(NEED_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  budget: optionalPositiveDecimal,
  notes: noteText(),
  districts: z.array(z.string().trim().max(100)).max(20).optional(),
  propertyType: optionalText(80),
  assignedToId: optionalCuid,
};

export const createLeadSchema = z.object(leadBase).strict();

export const updateLeadSchema = z
  .object({
    ...leadBase,
    firstName: shortText(100).optional(),
    phone: optionalPhone,
  })
  .strict();

export const bulkLeadSchema = z
  .object({
    action: z.enum(['delete', 'assign', 'status']),
    ids: z.array(cuid).min(1).max(500),
    assignedToId: optionalCuid,
    status: z.enum(LEAD_STATUSES).optional(),
  })
  .strict();

export const importLeadsSchema = z
  .object({
    leads: z
      .array(
        z.object({
          firstName: shortText(100),
          lastName: optionalText(100),
          phone: optionalPhone,
          email: optionalEmail,
          source: z.enum(LEAD_SOURCES).optional(),
        }),
      )
      .min(1)
      .max(500),
  })
  .strict();

// ── Lead distribution ─────────────────────────────────────────────────────────

export const createDistributionRuleSchema = z
  .object({
    name: shortText(120),
    source: z.enum(LEAD_SOURCES).optional(),
    district: optionalText(100),
    propertyType: optionalText(80),
    needType: z.enum(NEED_TYPES).optional(),
    assignToId: cuid,
    priority: z.number().int().min(0).max(9999).optional(),
  })
  .strict();

export const updateDistributionRuleSchema = createDistributionRuleSchema.partial().extend({
  id: cuid,
});

// ── Communication ─────────────────────────────────────────────────────────────

export const createCommunicationSchema = z
  .object({
    leadId: cuid,
    type: z.enum(['call', 'email', 'meeting', 'note', 'sms', 'other']),
    direction: z.enum(['inbound', 'outbound']).optional(),
    content: z
      .string()
      .trim()
      .min(1, 'Required')
      .max(4000, 'Max 4000 chars')
      .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
  })
  .strict();
