import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../../app/config/env';
import { UnauthorizedError } from '../errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = req.cookies?.crm_token as string | undefined;
  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload & AuthenticatedUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid session token'));
  }
}
