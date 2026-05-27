"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportingRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const analytics_service_1 = require("../services/analytics.service");
const dashboard_service_1 = require("../services/dashboard.service");
const search_service_1 = require("../services/search.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/dashboard/stats', async (req, res) => {
    res.json(await (0, dashboard_service_1.getDashboardStats)(req.user?.id, req.user?.role));
});
router.get('/analytics/extended', async (req, res) => {
    res.json(await (0, analytics_service_1.getExtendedAnalytics)(req.query, req.user?.id, req.user?.role));
});
router.get('/search', async (req, res) => {
    res.json(await (0, search_service_1.searchDashboard)(req.query, req.user?.id, req.user?.role));
});
exports.reportingRoutes = router;
