import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { setAgencyContext } from '../agency/context';

export interface RequestAgencyContext {
  agencyId: string;
  userId: string;
  membershipRole: string;
}

declare global {
  namespace Express {
    interface Request {
      agency?: RequestAgencyContext;
    }
  }
}

export async function agencyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const requestedAgencyId = req.header('x-agency-id');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastAgencyId: true,
      memberships: {
        where: { isActive: true },
        select: { agencyId: true, role: true },
      },
    },
  });

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const fallbackAgencyId = user.lastAgencyId ?? user.memberships[0]?.agencyId;
  const agencyId = requestedAgencyId || fallbackAgencyId;

  if (!agencyId) {
    res.status(403).json({ error: 'No active agency membership' });
    return;
  }

  const membership = user.memberships.find((item) => item.agencyId === agencyId);
  if (!membership) {
    res.status(403).json({ error: 'Access denied for agency' });
    return;
  }

  req.agency = { agencyId, userId, membershipRole: membership.role };

  if (user.lastAgencyId !== agencyId) {
    await prisma.user.update({ where: { id: userId }, data: { lastAgencyId: agencyId } });
  }

  setAgencyContext(req.agency);
  next();
}
