"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportingFacade = void 0;
const analytics_service_1 = require("../services/analytics.service");
const dashboard_service_1 = require("../services/dashboard.service");
const search_service_1 = require("../services/search.service");
exports.reportingFacade = {
    getDashboardStats: dashboard_service_1.getDashboardStats,
    getExtendedAnalytics: analytics_service_1.getExtendedAnalytics,
    searchDashboard: search_service_1.searchDashboard,
};
