import { z } from 'zod';
import { shortText, cuid } from '../../../common/validation/common';

// ── Chat direct message ───────────────────────────────────────────────────────

export const sendDirectMessageSchema = z
  .object({
    roomId: cuid.optional(),
    receiverId: cuid.optional(),
    text: z
      .string()
      .trim()
      .min(1, 'Required')
      .max(4000, 'Max 4000 chars')
      .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
    threadId: cuid.optional(),
    mentions: z.array(cuid).max(100).optional(),
  })
  .refine((value) => Boolean(value.roomId || value.receiverId), {
    message: 'roomId or receiverId required',
    path: ['roomId'],
  })
  .strict();

// ── Chat room ─────────────────────────────────────────────────────────────────

export const updateChatRoomSchema = z
  .object({
    roomId: cuid,
    name: shortText(120).optional(),
    addMemberIds: z.array(cuid).max(100).optional(),
    removeMemberIds: z.array(cuid).max(100).optional(),
  })
  .strict();

export const createChatRoomSchema = z
  .object({
    name: shortText(120).optional(),
    memberIds: z.array(cuid).min(1, 'At least one member required').max(100),
  })
  .strict();
