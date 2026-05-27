"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSuccessRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const aftercare_service_1 = require("../services/aftercare.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/aftercare-plans', async (_req, res) => {
    res.json(await (0, aftercare_service_1.listAftercarePlans)());
});
router.put('/aftercare-plans', async (req, res) => {
    res.json(await (0, aftercare_service_1.reorderAftercarePlans)(req.body ?? {}));
});
router.post('/aftercare-plans', async (req, res) => {
    res.status(201).json(await (0, aftercare_service_1.addAftercarePlan)(req.body ?? {}));
});
router.put('/aftercare-plans/:id', async (req, res) => {
    res.json(await (0, aftercare_service_1.changeAftercarePlan)(req.params.id, req.body ?? {}));
});
router.delete('/aftercare-plans/:id', async (req, res) => {
    res.json(await (0, aftercare_service_1.removeAftercarePlan)(req.params.id));
});
exports.customerSuccessRoutes = router;
