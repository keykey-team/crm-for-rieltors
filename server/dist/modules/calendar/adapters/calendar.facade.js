"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarFacade = void 0;
const calendar_service_1 = require("../services/calendar.service");
exports.calendarFacade = {
    listEvents: calendar_service_1.listEvents,
};
