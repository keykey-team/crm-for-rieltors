"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationFacade = void 0;
const automation_service_1 = require("../services/automation.service");
exports.automationFacade = {
    listAutomations: automation_service_1.listAutomations,
};
