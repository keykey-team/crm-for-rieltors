"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
const roles_1 = require("../../../common/shared-kernel/roles");
const notification_repository_1 = require("../repositories/notification.repository");
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
function activityHref(log) {
    if (log.entityType === 'lead')
        return `/leads/${log.entityId}`;
    if (log.entityType === 'deal')
        return `/deals/${log.entityId}`;
    return '/activity-log';
}
async function getNotifications(userId, role) {
    const now = new Date();
    const where = ownership(role, userId);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [recentLogs, overdueTasks, newLeadsCount] = await Promise.all([
        (0, notification_repository_1.findRecentActivityLogs)(now, userId, role),
        (0, notification_repository_1.findOverdueTasks)(where, now),
        (0, notification_repository_1.countNewLeadsToday)(where, todayStart),
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
