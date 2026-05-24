import { getExtendedAnalytics } from '../services/analytics.service';
import { getDashboardStats } from '../services/dashboard.service';
import { searchDashboard } from '../services/search.service';

export const reportingFacade = {
  getDashboardStats,
  getExtendedAnalytics,
  searchDashboard,
};
