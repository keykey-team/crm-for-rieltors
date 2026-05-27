"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationFacade = exports.communicationRoutes = void 0;
var communication_routes_1 = require("./controllers/communication.routes");
Object.defineProperty(exports, "communicationRoutes", { enumerable: true, get: function () { return communication_routes_1.communicationRoutes; } });
var communication_facade_1 = require("./adapters/communication.facade");
Object.defineProperty(exports, "communicationFacade", { enumerable: true, get: function () { return communication_facade_1.communicationFacade; } });
