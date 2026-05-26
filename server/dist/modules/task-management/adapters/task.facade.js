"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFacade = void 0;
const task_service_1 = require("../services/task.service");
exports.taskFacade = {
    listTasks: task_service_1.listTasks,
};
