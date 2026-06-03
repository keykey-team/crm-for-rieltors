import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { runWithAgencyContext } from '../agency/context';

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
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const requestedAgencyId = req.header('x-agency-id');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        lastAgencyId: true,
        memberships: {
          select: { agencyId: true, role: true, isActive: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const activeMemberships = user.memberships.filter((item: { isActive: boolean }) => item.isActive);
    const fallbackAgencyId = user.lastAgencyId ?? activeMemberships[0]?.agencyId;
    const requestedMembership = requestedAgencyId
      ? activeMemberships.find((item: { agencyId: string; role: string; isActive: boolean }) => item.agencyId === requestedAgencyId)
      : undefined;
    const agencyId = requestedMembership?.agencyId ?? fallbackAgencyId;

    let membership = requestedMembership
      ?? activeMemberships.find((item: { agencyId: string; role: string; isActive: boolean }) => item.agencyId === agencyId);

    if (!membership) {
      const fallbackInactive = agencyId
        ? user.memberships.find((item: { agencyId: string; role: string; isActive: boolean }) => item.agencyId === agencyId)
        : user.memberships[0];
      if (fallbackInactive) {
        await prisma.agencyMembership.update({
          where: { agencyId_userId: { agencyId: fallbackInactive.agencyId, userId } },
          data: { isActive: true },
        });
        membership = { ...fallbackInactive, isActive: true };
      }
    }

    if (!membership) {
      const roomMembership = await prisma.chatRoomMember.findFirst({
        where: { userId },
        include: {
          room: {
            select: { agencyId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (roomMembership?.room?.agencyId) {
        const membershipRole = user.role === 'director' || user.role === 'admin' ? 'admin' : 'agent';
        await prisma.agencyMembership.upsert({
          where: { agencyId_userId: { agencyId: roomMembership.room.agencyId, userId } },
          create: {
            agencyId: roomMembership.room.agencyId,
            userId,
            role: membershipRole,
            isActive: true,
          },
          update: { isActive: true },
        });
        membership = { agencyId: roomMembership.room.agencyId, role: membershipRole, isActive: true };
      }
    }

    if (!membership) {
      const anyAgency = await prisma.agency.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (anyAgency?.id) {
        const membershipRole = user.role === 'director' || user.role === 'admin' ? 'admin' : 'agent';
        await prisma.agencyMembership.upsert({
          where: { agencyId_userId: { agencyId: anyAgency.id, userId } },
          create: {
            agencyId: anyAgency.id,
            userId,
            role: membershipRole,
            isActive: true,
          },
          update: { isActive: true },
        });
        membership = { agencyId: anyAgency.id, role: membershipRole, isActive: true };
      }
    }

    if (!membership) {
      res.status(403).json({ error: 'No active agency membership' });
      return;
    }

    req.agency = { agencyId: membership.agencyId, userId, membershipRole: membership.role };

    if (user.lastAgencyId !== membership.agencyId) {
      await prisma.user.update({ where: { id: userId }, data: { lastAgencyId: membership.agencyId } });
    }

    runWithAgencyContext(req.agency, () => {
      next();
    });
  } catch (error) {
    console.error('agencyMiddleware error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
