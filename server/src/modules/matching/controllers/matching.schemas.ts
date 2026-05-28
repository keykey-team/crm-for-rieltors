import { z } from 'zod';
import { cuid, noteText, optionalText, optionalCuid } from '../../../common/validation/common';

const reaction = z.enum(['like', 'dislike', 'want_to_view']);

export const createSelectionSchema = z
  .object({
    leadId: cuid,
    propertyIds: z.array(cuid).min(1).max(100),
    title: optionalText(180),
    message: noteText(1000),
    expiresAt: z.string().datetime({ offset: true, message: 'Invalid ISO date' }).optional().nullable(),
  })
  .strict();

export const addSelectionItemsSchema = z
  .object({
    propertyIds: z.array(cuid).min(1).max(100),
  })
  .strict();

export const reorderSelectionItemsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            itemId: cuid,
            order: z.number().int().min(0),
          })
          .strict(),
      )
      .min(1)
      .max(300),
  })
  .strict();

export const updateSelectionItemSchema = z
  .object({
    agentComment: optionalText(2000),
  })
  .strict();

export const updateSelectionSchema = z
  .object({
    title: optionalText(180),
    message: noteText(1000),
    expiresAt: z.string().datetime({ offset: true, message: 'Invalid ISO date' }).optional().nullable(),
  })
  .strict();

export const reactionSchema = z
  .object({
    reaction,
    clientNote: optionalText(1000),
  })
  .strict();

export const listSelectionsSchema = z
  .object({
    leadId: optionalCuid,
  })
  .strict();
