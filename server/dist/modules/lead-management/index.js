"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadFacade = exports.leadRoutes = void 0;
var lead_routes_1 = require("./controllers/lead.routes");
Object.defineProperty(exports, "leadRoutes", { enumerable: true, get: function () { return lead_routes_1.leadRoutes; } });
var lead_facade_1 = require("./adapters/lead.facade");
Object.defineProperty(exports, "leadFacade", { enumerable: true, get: function () { return lead_facade_1.leadFacade; } });
