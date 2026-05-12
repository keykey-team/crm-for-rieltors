export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter, hasRole } from '@/lib/role-guard';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const of = ownershipFilter(user);
    const ofTask = ownershipFilter(user);

    const [totalLeads, newLeads, totalDeals, activeDeals, totalProperties, totalTasks, pendingTasks, todayTasks] = await Promise.all([
      prisma.lead.count({ where: of }),
      prisma.lead.count({ where: { ...of, status: 'new' } }),
      prisma.deal.count({ where: of }),
      prisma.deal.count({ where: { ...of, stage: { notIn: ['closed', 'rejected'] } } }),
      prisma.property.count(),
      prisma.task.count({ where: ofTask }),
      prisma.task.count({ where: { ...ofTask, status: 'pending' } }),
      prisma.task.count({
        where: {
          ...ofTask,
          status: 'pending',
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    const recentLeads = await prisma.lead.findMany({
      where: of,
      take: 5, orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, phone: true, source: true, status: true, createdAt: true },
    });

    const dealsByStage = await prisma.deal.groupBy({
      by: ['stage'], _count: { id: true },
      where: of,
    });

    // Deals at risk: no update for 24h, not closed/rejected
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const riskDeals = await prisma.deal.findMany({
      where: {
        ...of,
        stage: { notIn: ['closed', 'rejected', 'aftercare'] },
        updatedAt: { lt: oneDayAgo },
      },
      take: 5,
      orderBy: { updatedAt: 'asc' },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    // Upcoming events/meetings
    const now = new Date();
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const upcomingEvents = await prisma.event.findMany({
      where: { startDate: { gte: now, lte: threeDaysLater } },
      take: 5,
      orderBy: { startDate: 'asc' },
    });

    // Today tasks detail
    const todayTasksList = await prisma.task.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: { lead: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json({
      totalLeads, newLeads, totalDeals, activeDeals,
      totalProperties, totalTasks, pendingTasks, todayTasks,
      recentLeads, dealsByStage, riskDeals, upcomingEvents, todayTasksList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
