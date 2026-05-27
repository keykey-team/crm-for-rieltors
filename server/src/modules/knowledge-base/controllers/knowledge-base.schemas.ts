import { z } from 'zod';
import { shortText, longContent } from '../../../common/validation/common';

const KB_CATEGORIES = ['general', 'sales', 'property', 'legal', 'faq', 'other'] as const;

const articleBase = {
  title: shortText(160),
  category: z.enum(KB_CATEGORIES).optional(),
  content: longContent(30000),
};

export const createArticleSchema = z.object(articleBase).strict();
export const updateArticleSchema = z.object(articleBase).partial().strict();
