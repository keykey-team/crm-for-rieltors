"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationFacade = exports.notificationRoutes = void 0;
var notification_routes_1 = require("./controllers/notification.routes");
Object.defineProperty(exports, "notificationRoutes", { enumerable: true, get: function () { return notification_routes_1.notificationRoutes; } });
var notification_facade_1 = require("./adapters/notification.facade");
Object.defineProperty(exports, "notificationFacade", { enumerable: true, get: function () { return notification_facade_1.notificationFacade; } });
