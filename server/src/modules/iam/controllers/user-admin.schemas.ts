import { z } from 'zod';
import { shortText, email, password, optionalPhone } from '../../../common/validation/common';

const ROLES = ['admin', 'director', 'agent'] as const;

const userBase = {
  name: shortText(100),
  email,
  role: z.enum(ROLES),
  phone: optionalPhone,
};

export const createUserSchema = z
  .object({ ...userBase, password })
  .strict();

export const updateUserSchema = z
  .object({
    ...userBase,
    name: shortText(100).optional(),
    email: email.optional(),
    role: z.enum(ROLES).optional(),
    password: password.optional(),
  })
  .strict();
