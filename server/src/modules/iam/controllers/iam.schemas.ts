import { z } from 'zod';
import { email, password, shortText } from '../../../common/validation/common';

export const signupSchema = z
  .object({
    accountType: z.enum(['agent', 'agency']),
    name: shortText(100),
    email,
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'Required').max(128, 'Max 128 chars'),
  })
  .strict();
