import { z } from 'zod';
import {
  shortText,
  optionalPhone,
  optionalText,
  optionalUrl,
  password,
} from '../../../common/validation/common';

// ── Profile ───────────────────────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: shortText(100).optional(),
    phone: optionalPhone,
    newPassword: password.optional(),
    avatar: z
      .string()
      .trim()
      .max(500)
      .regex(/^[\w\-./]+$/, 'Invalid file path')
      .optional()
      .or(z.literal('')),
    telegramUrl: optionalUrl,
  })
  .strict();

// ── Brand ─────────────────────────────────────────────────────────────────────

export const updateBrandSchema = z
  .object({
    brandName: optionalText(120),
    brandLogo: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal('')),
    themeMode: z.enum(['light', 'dark', 'system']).optional(),
    sidebarGlass: z.boolean().optional(),
    sidebarOpacity: z.number().min(0.3).max(1).optional(),
    gradientBg: z.boolean().optional(),
  })
  .strict();

// ── Plan ──────────────────────────────────────────────────────────────────────

export const changePlanSchema = z
  .object({
    plan: z.enum(['free', 'pro', 'enterprise']),
  })
  .strict();
