import { z } from 'zod';
import { noteText, optionalCuid } from '../../../common/validation/common';

const SHOWING_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

function emptyStringToUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;
  return value;
}

const optionalId = z.preprocess((value) => emptyStringToUndefined(value), optionalCuid);

const optionalDate = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (!normalized) return undefined;
  return typeof normalized === 'string' ? new Date(normalized) : normalized;
}, z.date().optional());

const optionalInt = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, z.number().int().min(1).optional());

export const listShowingsQuerySchema = z.object({
  dealId: optionalId,
  propertyId: optionalId,
  leadId: optionalId,
  agentId: optionalId,
  status: z.enum(SHOWING_STATUSES).optional(),
  from: optionalDate,
  to: optionalDate,
  page: optionalInt,
  limit: optionalInt,
}).strict();

export const createShowingSchema = z.object({
  dealId: optionalId,
  propertyId: z.string().trim().min(1, 'Required'),
  leadId: optionalId,
  agentId: optionalId,
  scheduledAt: z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date()),
  durationMin: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return 30;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().min(5).max(1440).default(30)),
  status: z.enum(SHOWING_STATUSES).optional(),
  feedback: noteText(),
  clientRating: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().min(1).max(5).optional()),
  agentNotes: noteText(),
  createEvent: z.boolean().optional(),
}).strict();

export const updateShowingSchema = z.object({
  dealId: optionalId,
  propertyId: optionalId,
  leadId: optionalId,
  agentId: optionalId,
  scheduledAt: optionalDate,
  durationMin: z.preprocess((value) => {
    const normalized = emptyStringToUndefined(value);
    if (normalized === undefined) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }, z.number().int().min(5).max(1440).optional()),
  status: z.enum(SHOWING_STATUSES).optional(),
  feedback: noteText(),
  clientRating: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().min(1).max(5).optional()),
  agentNotes: noteText(),
}).strict().refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field is required' });

export const duplicatesQuerySchema = z.object({
  propertyId: z.string().trim().min(1, 'Required'),
  leadId: z.string().trim().min(1, 'Required'),
}).strict();

export type ShowingStatus = (typeof SHOWING_STATUSES)[number];
