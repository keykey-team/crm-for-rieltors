import { isAdminRole } from '../../../common/shared-kernel/roles';
import { findRecentDashboardLeads, getDashboardCounts, groupDashboardDealsByStage } from '../repositories/dashboard.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

export async function getDashboardStats(userId?: string, role?: string) {
  const where = ownership(role, userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const [counts, recentLeads, dealsByStage] = await Promise.all([
    getDashboardCounts(where, todayStart, todayEnd),
    findRecentDashboardLeads(where),
    groupDashboardDealsByStage(where),
  ]);

  return { ...counts, recentLeads, dealsByStage };
}
