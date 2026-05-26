"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const roles_1 = require("../../../common/shared-kernel/roles");
const dashboard_repository_1 = require("../repositories/dashboard.repository");
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
async function getDashboardStats(userId, role) {
    const where = ownership(role, userId);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const [counts, recentLeads, dealsByStage] = await Promise.all([
        (0, dashboard_repository_1.getDashboardCounts)(where, todayStart, todayEnd),
        (0, dashboard_repository_1.findRecentDashboardLeads)(where),
        (0, dashboard_repository_1.groupDashboardDealsByStage)(where),
    ]);
    return { ...counts, recentLeads, dealsByStage };
}
