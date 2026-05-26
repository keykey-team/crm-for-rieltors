"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const notification_service_1 = require("../services/notification.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/notifications', async (req, res) => {
    res.json(await (0, notification_service_1.getNotifications)(req.user?.id, req.user?.role));
});
exports.notificationRoutes = router;
