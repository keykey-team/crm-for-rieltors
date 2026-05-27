"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const property_service_1 = require("../services/property.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/properties', async (req, res) => {
    res.json(await (0, property_service_1.listProperties)({
        search: typeof req.query.search === 'string' ? req.query.search : '',
        status: typeof req.query.status === 'string' ? req.query.status : '',
        type: typeof req.query.type === 'string' ? req.query.type : '',
    }));
});
router.post('/properties', async (req, res) => {
    res.status(201).json(await (0, property_service_1.addProperty)(req.body ?? {}));
});
router.put('/properties/:id', async (req, res) => {
    res.json(await (0, property_service_1.changeProperty)(req.params.id, req.body ?? {}));
});
router.delete('/properties/:id', async (req, res) => {
    res.json(await (0, property_service_1.removeProperty)(req.params.id));
});
router.get('/property-units', async (req, res) => {
    res.json(await (0, property_service_1.listPropertyUnits)(req.query.propertyId));
});
router.post('/property-units', async (req, res) => {
    res.status(201).json(await (0, property_service_1.addPropertyUnit)(req.body ?? {}));
});
router.put('/property-units', async (req, res) => {
    res.json(await (0, property_service_1.changePropertyUnit)(req.body ?? {}));
});
router.delete('/property-units', async (req, res) => {
    res.json(await (0, property_service_1.removePropertyUnit)(req.query.id));
});
exports.propertyRoutes = router;
