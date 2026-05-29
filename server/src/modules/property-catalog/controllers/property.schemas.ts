import { z } from 'zod';
import {
  shortText,
  optionalText,
  noteText,
  optionalPositiveDecimal,
  optionalPositiveInt,
  positiveDecimal,
  cuid,
  optionalCuid,
} from '../../../common/validation/common';

const PROPERTY_TYPES = ['apartment', 'house', 'commercial', 'land', 'garage', 'other'] as const;
const PROPERTY_STATUSES = ['active', 'available', 'reserved', 'sold', 'rented', 'inactive'] as const;
const PROPERTY_DEAL_TYPES = ['sale', 'rent'] as const;
const CURRENCIES = ['UAH', 'USD', 'EUR'] as const;
const UNIT_STATUSES = ['available', 'reserved', 'sold'] as const;
const PRICE_HISTORY_REASONS = ['manual', 'auto-discount', 'market-correction', 'import', 'other'] as const;

function emptyStringToUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;
  return value;
}

const propertyOptionalInt = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, optionalPositiveInt);

const propertyOptionalDecimal = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, optionalPositiveDecimal);

const propertyRequiredDecimal = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (typeof normalized === 'string') {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : normalized;
  }
  return normalized;
}, positiveDecimal);

const propertyDealTypes = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return value;
}, z.array(z.enum(PROPERTY_DEAL_TYPES)).min(1).optional());

// ── Property ──────────────────────────────────────────────────────────────────

const propertyBase = {
  title: shortText(150),
  type: z.enum(PROPERTY_TYPES).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  address: shortText(250),
  district: optionalText(100),
  city: optionalText(100),
  rooms: propertyOptionalInt,
  area: propertyOptionalDecimal,
  floor: propertyOptionalInt,
  totalFloors: propertyOptionalInt,
  price: propertyRequiredDecimal,
  currency: z.enum(CURRENCIES).optional(),
  dealTypes: propertyDealTypes,
  description: z.string().trim().max(3000).optional(),
  priceHistoryReason: z.string().trim().min(1).max(120).optional(),
  priceHistoryNote: noteText(500).optional(),
};

export const createPropertySchema = z
  .object(propertyBase)
  .strict()
  .refine(
    (d) => d.floor == null || d.totalFloors == null || d.floor <= d.totalFloors,
    { message: 'floor must be <= totalFloors', path: ['floor'] },
  );

export const updatePropertySchema = z
  .object({
    ...propertyBase,
    title: shortText(150).optional(),
    address: shortText(250).optional(),
    price: propertyOptionalDecimal,
  })
  .strict()
  .refine(
    (d) => d.floor == null || d.totalFloors == null || d.floor <= d.totalFloors,
    { message: 'floor must be <= totalFloors', path: ['floor'] },
  );

// ── Property unit ─────────────────────────────────────────────────────────────

export const createPropertyUnitSchema = z
  .object({
    propertyId: cuid,
    unitNumber: shortText(50),
    floor: z.number().int().min(0),
    section: z.number().int().min(1).optional(),
    rooms: optionalPositiveInt,
    area: optionalPositiveDecimal,
    price: optionalPositiveDecimal,
    status: z.enum(UNIT_STATUSES).optional(),
  })
  .strict();

export const createPropertyPricePointSchema = z
  .object({
    price: positiveDecimal,
    currency: z.enum(CURRENCIES).optional(),
    reason: z.enum(PRICE_HISTORY_REASONS).optional(),
    note: noteText(500).optional(),
    createdAt: z.coerce.date().optional(),
  })
  .strict();

export const updatePropertyUnitSchema = z
  .object({
    id: cuid,
    unitNumber: shortText(50).optional(),
    floor: z.number().int().min(0).optional(),
    section: z.number().int().min(1).optional(),
    rooms: optionalPositiveInt,
    area: optionalPositiveDecimal,
    price: optionalPositiveDecimal,
    status: z.enum(UNIT_STATUSES).optional(),
  })
  .strict();
