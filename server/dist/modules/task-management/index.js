"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFacade = exports.taskRoutes = void 0;
var task_routes_1 = require("./controllers/task.routes");
Object.defineProperty(exports, "taskRoutes", { enumerable: true, get: function () { return task_routes_1.taskRoutes; } });
var task_facade_1 = require("./adapters/task.facade");
Object.defineProperty(exports, "taskFacade", { enumerable: true, get: function () { return task_facade_1.taskFacade; } });
