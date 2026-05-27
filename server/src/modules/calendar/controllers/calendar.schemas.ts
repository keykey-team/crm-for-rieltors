import { z } from 'zod';
import { shortText, noteText, isoDate } from '../../../common/validation/common';

const EVENT_TYPES = ['meeting', 'showing', 'call', 'other'] as const;

const eventBase = {
  title: shortText(150),
  type: z.enum(EVENT_TYPES).optional(),
  startDate: z.string().trim().datetime({ offset: true, message: 'Invalid ISO date' }),
  endDate: isoDate,
  description: noteText(),
};

export const createEventSchema = z.object(eventBase).strict();
export const updateEventSchema = z.object(eventBase).partial().strict();
