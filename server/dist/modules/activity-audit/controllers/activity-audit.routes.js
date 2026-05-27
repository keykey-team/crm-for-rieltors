"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityAuditRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const activity_log_service_1 = require("../services/activity-log.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/activity-log', async (req, res) => {
    res.json(await (0, activity_log_service_1.listActivityLogs)({
        entityType: typeof req.query.entityType === 'string' ? req.query.entityType : '',
        entityId: typeof req.query.entityId === 'string' ? req.query.entityId : '',
    }));
});
exports.activityAuditRoutes = router;
