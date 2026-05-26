"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityAuditFacade = exports.activityAuditRoutes = void 0;
var activity_audit_routes_1 = require("./controllers/activity-audit.routes");
Object.defineProperty(exports, "activityAuditRoutes", { enumerable: true, get: function () { return activity_audit_routes_1.activityAuditRoutes; } });
var activity_audit_facade_1 = require("./adapters/activity-audit.facade");
Object.defineProperty(exports, "activityAuditFacade", { enumerable: true, get: function () { return activity_audit_facade_1.activityAuditFacade; } });
