import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { getExtendedAnalytics } from '../services/analytics.service';
import { getDashboardStats } from '../services/dashboard.service';
import { searchDashboard } from '../services/search.service';

const router = createAsyncRouter();

router.get('/dashboard/stats', async (req, res) => {
  res.json(await getDashboardStats(req.user?.id, req.user?.role));
});

router.get('/analytics/extended', async (req, res) => {
  res.json(await getExtendedAnalytics(req.query, req.user?.id, req.user?.role));
});

router.get('/search', async (req, res) => {
  res.json(await searchDashboard(req.query, req.user?.id, req.user?.role));
});

export const reportingRoutes = router;
