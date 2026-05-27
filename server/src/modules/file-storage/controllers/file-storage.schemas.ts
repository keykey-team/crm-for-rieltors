import { z } from 'zod';

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const presignedUploadSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(1, 'Required')
      .max(255, 'Max 255 chars')
      .regex(/^[\w\-. ]+$/, 'Invalid file name'),
    contentType: z.enum(ALLOWED_MIME, 'File type not allowed'),
    size: z.number().int().min(1).max(MAX_FILE_SIZE, 'File too large (max 10 MB)'),
    isPublic: z.boolean().optional(),
  })
  .strict();
