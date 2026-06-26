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

const UNIT_STATUSES = ['available', 'reserved', 'sold', 'unavailable'] as const;
const PRICE_HISTORY_REASONS = ['manual', 'auto-discount', 'market-correction', 'import', 'other'] as const;

const dictionaryValue = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, digits, _ and - allowed');

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
}, z.array(dictionaryValue).min(1).optional());

const propertyDictionaryArray = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return value;
}, z.array(dictionaryValue).optional());

const propertyOptionalUrl = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  return normalized;
}, z.string().trim().url().max(2048).optional());

const propertyOptionalDateTime = z.preprocess((value) => {
  const normalized = emptyStringToUndefined(value);
  if (normalized === undefined) return undefined;
  if (normalized instanceof Date) return normalized;
  if (typeof normalized === 'string') {
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? normalized : parsed;
  }
  return normalized;
}, z.date().optional());

const propertyPhotos = z.array(
  z.object({
    cloudStoragePath: z.string().trim().min(1).max(1024),
    isPublic: z.boolean().optional(),
  }).strict(),
).optional();

const propertyDocuments = z.array(
  z.object({
    title: z.string().trim().min(1).max(255),
    documentType: dictionaryValue.optional(),
    cloudStoragePath: z.string().trim().min(1).max(1024),
  }).strict(),
).optional();

const propertyMediaLinks = z.array(
  z.object({
    title: z.string().trim().min(1).max(255),
    mediaType: dictionaryValue.optional(),
    url: z.string().trim().url().max(2048),
  }).strict(),
).optional();

const propertyPublications = z.array(
  z.object({
    channel: dictionaryValue,
    status: dictionaryValue,
    url: z.string().trim().url().max(2048).optional(),
    note: noteText(500).optional(),
    publishedAt: propertyOptionalDateTime,
    lastSyncedAt: propertyOptionalDateTime,
  }).strict(),
).optional();

// ── Property ──────────────────────────────────────────────────────────────────

const propertyBase = {
  title: shortText(150),
  internalCode: optionalText(80),
  type: dictionaryValue.optional(),
  source: dictionaryValue.optional(),
  status: dictionaryValue.optional(),
  ownerName: optionalText(120),
  ownerPhone: optionalText(40),
  developerName: optionalText(160),
  developerContact: optionalText(120),
  address: shortText(250),
  district: optionalText(100),
  city: optionalText(100),
  rooms: propertyOptionalInt,
  bedrooms: propertyOptionalInt,
  bathrooms: propertyOptionalInt,
  area: propertyOptionalDecimal,
  landArea: propertyOptionalDecimal,
  floor: propertyOptionalInt,
  totalFloors: propertyOptionalInt,
  price: propertyRequiredDecimal,
  currency: dictionaryValue.optional(),
  dealTypes: propertyDealTypes,
  paymentCondition: dictionaryValue.optional(),
  communicationTypes: propertyDictionaryArray,
  tags: propertyDictionaryArray,
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  publicationNotes: noteText(1000).optional(),
  layoutType: dictionaryValue.optional(),
  repairType: dictionaryValue.optional(),
  heatingType: dictionaryValue.optional(),
  wallType: dictionaryValue.optional(),
  realEstateClass: dictionaryValue.optional(),
  commercialPurpose: dictionaryValue.optional(),
  parkingType: dictionaryValue.optional(),
  parkingSpaces: propertyOptionalInt,
  yearBuilt: propertyOptionalInt,
  ceilingHeight: propertyOptionalDecimal,
  managerComment: noteText(1000).optional(),
  internalDescription: z.string().trim().max(3000).optional(),
  publicDescription: z.string().trim().max(3000).optional(),
  description: z.string().trim().max(3000).optional(),
  mediaLinks: propertyMediaLinks,
  publications: propertyPublications,
  documents: propertyDocuments,
  photos: propertyPhotos,
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
    currency: dictionaryValue.optional(),
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
