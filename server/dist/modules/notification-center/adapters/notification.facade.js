"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationFacade = void 0;
const notification_service_1 = require("../services/notification.service");
exports.notificationFacade = {
    getNotifications: notification_service_1.getNotifications,
};
