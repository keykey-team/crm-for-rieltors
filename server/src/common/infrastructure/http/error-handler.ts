import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({ error: 'Foreign key constraint failed' });
      return;
    }
  }
  const status = err?.status ?? 500;
  res.status(status).json({ error: err?.message ?? 'Internal server error' });
}

