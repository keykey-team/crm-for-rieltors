import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../shared-kernel/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_';
        if (!fields[key]) fields[key] = issue.message;
      }
      const err = new AppError(400, 'Validation failed');
      (err as any).fields = fields;
      return next(err);
    }
    req.body = result.data;
    next();
  };
}
