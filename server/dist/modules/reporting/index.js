"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportingFacade = exports.reportingRoutes = void 0;
var reporting_routes_1 = require("./controllers/reporting.routes");
Object.defineProperty(exports, "reportingRoutes", { enumerable: true, get: function () { return reporting_routes_1.reportingRoutes; } });
var reporting_facade_1 = require("./adapters/reporting.facade");
Object.defineProperty(exports, "reportingFacade", { enumerable: true, get: function () { return reporting_facade_1.reportingFacade; } });
