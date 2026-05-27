"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarFacade = exports.calendarRoutes = void 0;
var calendar_routes_1 = require("./controllers/calendar.routes");
Object.defineProperty(exports, "calendarRoutes", { enumerable: true, get: function () { return calendar_routes_1.calendarRoutes; } });
var calendar_facade_1 = require("./adapters/calendar.facade");
Object.defineProperty(exports, "calendarFacade", { enumerable: true, get: function () { return calendar_facade_1.calendarFacade; } });
