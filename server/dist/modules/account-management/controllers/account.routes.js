"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const account_service_1 = require("../services/account.service");
const middleware_1 = require("../../../common/validation/middleware");
const account_schemas_1 = require("./account.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/settings/profile', async (req, res) => {
    res.json(await (0, account_service_1.getProfile)(req.user.id));
});
router.put('/settings/profile', (0, middleware_1.validateBody)(account_schemas_1.updateProfileSchema), async (req, res) => {
    res.json(await (0, account_service_1.changeProfile)(req.user.id, req.body));
});
router.get('/settings/brand', async (req, res) => {
    res.json(await (0, account_service_1.getBrandSettings)(req.user.id));
});
router.put('/settings/brand', (0, middleware_1.validateBody)(account_schemas_1.updateBrandSchema), async (req, res) => {
    res.json(await (0, account_service_1.changeBrandSettings)(req.user.id, req.body));
});
router.put('/users/plan', (0, middleware_1.validateBody)(account_schemas_1.changePlanSchema), async (req, res) => {
    res.json(await (0, account_service_1.changePlan)(req.user.id, req.body));
});
exports.accountRoutes = router;
