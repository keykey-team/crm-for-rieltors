import { isAdminRole } from '../../../common/shared-kernel/roles';
import { countNewLeadsToday, findOverdueTasks, findRecentActivityLogs } from '../repositories/notification.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

function activityHref(log: { entityType: string; entityId: string }) {
  if (log.entityType === 'lead') return `/leads/${log.entityId}`;
  if (log.entityType === 'deal') return `/deals/${log.entityId}`;
  return '/activity-log';
}

export async function getNotifications(userId?: string, role?: string) {
  const now = new Date();
  const where = ownership(role, userId);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [recentLogs, overdueTasks, newLeadsCount] = await Promise.all([
    findRecentActivityLogs(now, userId, role),
    findOverdueTasks(where, now),
    countNewLeadsToday(where, todayStart),
  ]);
  const notifications = [
    ...overdueTasks.map((task) => ({
      id: `task-${task.id}`,
      type: 'overdue_task',
      title: task.title,
      href: '/tasks',
      time: task.dueDate,
    })),
    ...recentLogs.map((log) => ({
      id: `log-${log.id}`,
      type: log.action,
      title: log.details || `${log.action} ${log.entityType}`,
      href: activityHref(log),
      time: log.createdAt,
      actor: log.user?.name,
    })),
  ];

  return { notifications, overdue: overdueTasks.length, newLeadsToday: newLeadsCount };
}
