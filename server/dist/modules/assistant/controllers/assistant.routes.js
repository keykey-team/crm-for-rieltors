"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const assistant_service_1 = require("../services/assistant.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/helper', async (req, res) => {
    res.json(await (0, assistant_service_1.getHelperSummary)(req.user.id));
});
router.post('/helper', async (req, res) => {
    res.json(await (0, assistant_service_1.receiveHelperMessage)(req.user.id, req.body?.message));
});
router.post('/assistant', async (req, res) => {
    res.json(await (0, assistant_service_1.receiveAssistantMessage)(req.user.id, req.body?.message));
});
exports.assistantRoutes = router;
