"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showingRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const middleware_1 = require("../../../common/validation/middleware");
const errors_1 = require("../../../common/shared-kernel/errors");
const showing_service_1 = require("../services/showing.service");
const showing_schemas_1 = require("./showing.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/showings', async (req, res) => {
    const parsed = showing_schemas_1.listShowingsQuerySchema.safeParse(req.query);
    if (!parsed.success)
        throw (0, errors_1.badRequest)(parsed.error.issues[0]?.message || 'Invalid query');
    res.json(await (0, showing_service_1.listShowings)(parsed.data, req.user?.id, req.user?.role));
});
router.get('/showings/duplicates', async (req, res) => {
    const parsed = showing_schemas_1.duplicatesQuerySchema.safeParse(req.query);
    if (!parsed.success)
        throw (0, errors_1.badRequest)(parsed.error.issues[0]?.message || 'Invalid query');
    res.json(await (0, showing_service_1.listDuplicates)(parsed.data.propertyId, parsed.data.leadId, req.user?.id, req.user?.role));
});
router.get('/showings/:id', async (req, res) => {
    res.json(await (0, showing_service_1.getShowing)(req.params.id, req.user?.id, req.user?.role));
});
router.post('/showings', (0, middleware_1.validateBody)(showing_schemas_1.createShowingSchema), async (req, res) => {
    res.status(201).json(await (0, showing_service_1.addShowing)(req.body, req.user?.id));
});
router.patch('/showings/:id', (0, middleware_1.validateBody)(showing_schemas_1.updateShowingSchema), async (req, res) => {
    res.json(await (0, showing_service_1.changeShowing)(req.params.id, req.body, req.user?.id, req.user?.role));
});
router.delete('/showings/:id', async (req, res) => {
    res.json(await (0, showing_service_1.removeShowing)(req.params.id, req.user?.id, req.user?.role));
});
exports.showingRoutes = router;
