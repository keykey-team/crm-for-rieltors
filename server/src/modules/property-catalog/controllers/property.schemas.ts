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
const CURRENCIES = ['UAH', 'USD', 'EUR'] as const;
const UNIT_STATUSES = ['available', 'reserved', 'sold'] as const;

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
  description: z.string().trim().max(3000).optional(),
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
    section: optionalText(50),
    rooms: optionalPositiveInt,
    area: optionalPositiveDecimal,
    price: optionalPositiveDecimal,
    status: z.enum(UNIT_STATUSES).optional(),
  })
  .strict();

export const updatePropertyUnitSchema = z
  .object({
    id: cuid,
    unitNumber: shortText(50).optional(),
    floor: z.number().int().min(0).optional(),
    section: optionalText(50),
    rooms: optionalPositiveInt,
    area: optionalPositiveDecimal,
    price: optionalPositiveDecimal,
    status: z.enum(UNIT_STATUSES).optional(),
  })
  .strict();
