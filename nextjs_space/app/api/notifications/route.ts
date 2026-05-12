export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const ownership = ownershipFilter(user);

    // Fetch recent activity logs (last 24h)
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        ...(user.role === 'agent' ? { userId: user.id } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } },
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        ...ownership,
        status: 'pending',
        dueDate: { lt: now },
      },
      select: { id: true, title: true, dueDate: true },
      take: 5,
    });

    // New leads today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newLeadsCount = await prisma.lead.count({
      where: {
        ...ownership,
        createdAt: { gte: todayStart },
      },
    });

    const notifications = [
      ...overdueTasks.map(t => ({
        id: `task-${t.id}`,
        type: 'overdue_task' as const,
        title: t.title,
        href: '/tasks',
        time: t.dueDate,
      })),
      ...recentLogs.map(log => ({
        id: `log-${log.id}`,
        type: log.action as string,
        title: log.details || `${log.action} ${log.entityType}`,
        href: log.entityType === 'lead' ? `/leads/${log.entityId}` : log.entityType === 'deal' ? `/deals/${log.entityId}` : '/activity-log',
        time: log.createdAt,
        actor: log.user?.name,
      })),
    ];

    return NextResponse.json({
      notifications,
      overdue: overdueTasks.length,
      newLeadsToday: newLeadsCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
