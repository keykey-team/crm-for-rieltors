"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantFacade = exports.assistantRoutes = void 0;
var assistant_routes_1 = require("./controllers/assistant.routes");
Object.defineProperty(exports, "assistantRoutes", { enumerable: true, get: function () { return assistant_routes_1.assistantRoutes; } });
var assistant_facade_1 = require("./adapters/assistant.facade");
Object.defineProperty(exports, "assistantFacade", { enumerable: true, get: function () { return assistant_facade_1.assistantFacade; } });
