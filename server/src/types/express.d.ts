import { AuthenticatedUser } from '../common/middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
