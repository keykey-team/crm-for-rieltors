"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const automation_service_1 = require("../services/automation.service");
const middleware_1 = require("../../../common/validation/middleware");
const automation_schemas_1 = require("./automation.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/automations', async (_req, res) => {
    res.json(await (0, automation_service_1.listAutomations)());
});
router.post('/automations', (0, middleware_1.validateBody)(automation_schemas_1.createAutomationSchema), async (req, res) => {
    res.status(201).json(await (0, automation_service_1.addAutomation)(req.user?.id, req.body));
});
router.put('/automations/:id', (0, middleware_1.validateBody)(automation_schemas_1.updateAutomationSchema), async (req, res) => {
    res.json(await (0, automation_service_1.changeAutomation)(req.params.id, req.body));
});
router.delete('/automations/:id', async (req, res) => {
    res.json(await (0, automation_service_1.removeAutomation)(req.params.id));
});
exports.automationRoutes = router;
