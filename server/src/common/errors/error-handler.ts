import { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  const error = err as Error;
  res.status(500).json({
    error: error?.message ?? 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
