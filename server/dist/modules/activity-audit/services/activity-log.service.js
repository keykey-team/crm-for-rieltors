"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivityLogs = listActivityLogs;
const activity_log_repository_1 = require("../repositories/activity-log.repository");
async function listActivityLogs(filters) {
    return (0, activity_log_repository_1.findActivityLogs)(filters);
}
