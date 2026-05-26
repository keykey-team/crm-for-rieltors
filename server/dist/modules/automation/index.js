"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationFacade = exports.automationRoutes = void 0;
var automation_routes_1 = require("./controllers/automation.routes");
Object.defineProperty(exports, "automationRoutes", { enumerable: true, get: function () { return automation_routes_1.automationRoutes; } });
var automation_facade_1 = require("./adapters/automation.facade");
Object.defineProperty(exports, "automationFacade", { enumerable: true, get: function () { return automation_facade_1.automationFacade; } });
