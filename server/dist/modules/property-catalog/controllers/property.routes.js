"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const middleware_1 = require("../../../common/validation/middleware");
const property_schemas_1 = require("./property.schemas");
const property_service_1 = require("../services/property.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/properties', async (req, res) => {
    res.json(await (0, property_service_1.listProperties)({
        search: typeof req.query.search === 'string' ? req.query.search : '',
        status: typeof req.query.status === 'string' ? req.query.status : '',
        type: typeof req.query.type === 'string' ? req.query.type : '',
        dealType: typeof req.query.dealType === 'string' ? req.query.dealType : '',
    }));
});
router.post('/properties', (0, middleware_1.validateBody)(property_schemas_1.createPropertySchema), async (req, res) => {
    res.status(201).json(await (0, property_service_1.addProperty)(req.body));
});
router.put('/properties/:id', (0, middleware_1.validateBody)(property_schemas_1.updatePropertySchema), async (req, res) => {
    res.json(await (0, property_service_1.changeProperty)(req.params.id, req.body));
});
router.delete('/properties/:id', async (req, res) => {
    res.json(await (0, property_service_1.removeProperty)(req.params.id));
});
router.get('/property-units', async (req, res) => {
    res.json(await (0, property_service_1.listPropertyUnits)(req.query.propertyId));
});
router.post('/property-units', (0, middleware_1.validateBody)(property_schemas_1.createPropertyUnitSchema), async (req, res) => {
    res.status(201).json(await (0, property_service_1.addPropertyUnit)(req.body));
});
router.put('/property-units', (0, middleware_1.validateBody)(property_schemas_1.updatePropertyUnitSchema), async (req, res) => {
    res.json(await (0, property_service_1.changePropertyUnit)(req.body));
});
router.delete('/property-units', async (req, res) => {
    res.json(await (0, property_service_1.removePropertyUnit)(req.query.id));
});
exports.propertyRoutes = router;
