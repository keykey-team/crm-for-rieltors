"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const account_service_1 = require("../services/account.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/settings/profile', async (req, res) => {
    res.json(await (0, account_service_1.getProfile)(req.user.id));
});
router.put('/settings/profile', async (req, res) => {
    res.json(await (0, account_service_1.changeProfile)(req.user.id, req.body ?? {}));
});
router.get('/settings/brand', async (req, res) => {
    res.json(await (0, account_service_1.getBrandSettings)(req.user.id));
});
router.put('/settings/brand', async (req, res) => {
    res.json(await (0, account_service_1.changeBrandSettings)(req.user.id, req.body ?? {}));
});
router.put('/users/plan', async (req, res) => {
    res.json(await (0, account_service_1.changePlan)(req.user.id, req.body ?? {}));
});
exports.accountRoutes = router;
