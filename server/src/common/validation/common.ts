import { z } from 'zod';

// ── Строки ──────────────────────────────────────────────────────────────────

export const shortText = (max = 120) =>
  z.string().trim().min(1, 'Required').max(max, `Max ${max} chars`);

export const optionalText = (max = 120) =>
  z.string().trim().max(max, `Max ${max} chars`).optional();

export const noteText = (max = 2000) =>
  z.string().trim().max(max, `Max ${max} chars`).optional();

export const longContent = (max = 10000) =>
  z.string().trim().min(1, 'Required').max(max, `Max ${max} chars`);

// ── Идентификаторы ───────────────────────────────────────────────────────────

export const cuid = z.string().trim().min(1, 'Required');
export const optionalCuid = z.string().trim().min(1).optional().nullable();

// ── Email / Phone ────────────────────────────────────────────────────────────

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Required')
  .max(254, 'Max 254 chars')
  .email('Invalid email format');

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email('Invalid email format')
  .optional()
  .or(z.literal(''));

export const phone = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(20, 'Max 20 chars')
  .regex(/^[+\d\s\-().]{1,20}$/, 'Invalid phone format');

export const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+\d\s\-().]{0,20}$/, 'Invalid phone format')
  .optional()
  .or(z.literal(''));

// ── Числа ────────────────────────────────────────────────────────────────────

export const positiveDecimal = z
  .number()
  .finite()
  .min(0, 'Must be >= 0');

export const optionalPositiveDecimal = positiveDecimal.optional().nullable();

export const positiveInt = z
  .number()
  .int()
  .min(0, 'Must be >= 0');

export const optionalPositiveInt = positiveInt.optional().nullable();

// ── Дата ─────────────────────────────────────────────────────────────────────

export const isoDate = z
  .string()
  .trim()
  .datetime({ offset: true, message: 'Invalid ISO date' })
  .optional()
  .nullable();

// ── Пароль ───────────────────────────────────────────────────────────────────

export const password = z
  .string()
  .min(8, 'Min 8 characters')
  .max(72, 'Max 72 characters');

// ── URL ──────────────────────────────────────────────────────────────────────

export const optionalUrl = z
  .string()
  .trim()
  .url('Invalid URL')
  .refine((v) => /^https?:\/\//i.test(v), 'Only http/https URLs allowed')
  .optional()
  .or(z.literal(''));

// ── Hex-цвет ─────────────────────────────────────────────────────────────────

export const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color like #AABBCC');
