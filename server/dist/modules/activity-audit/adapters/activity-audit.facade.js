"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityAuditFacade = void 0;
const activity_log_service_1 = require("../services/activity-log.service");
exports.activityAuditFacade = {
    listActivityLogs: activity_log_service_1.listActivityLogs,
};
