"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const template_service_1 = require("../services/template.service");
const middleware_1 = require("../../../common/validation/middleware");
const template_schemas_1 = require("./template.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/templates', async (req, res) => {
    const type = typeof req.query.type === 'string' ? req.query.type : '';
    res.json(await (0, template_service_1.listTemplates)(type));
});
router.post('/templates', (0, middleware_1.validateBody)(template_schemas_1.createTemplateSchema), async (req, res) => {
    res.status(201).json(await (0, template_service_1.addTemplate)(req.user?.id, req.body));
});
router.put('/templates/:id', (0, middleware_1.validateBody)(template_schemas_1.updateTemplateSchema), async (req, res) => {
    res.json(await (0, template_service_1.changeTemplate)(req.params.id, req.body));
});
router.delete('/templates/:id', async (req, res) => {
    res.json(await (0, template_service_1.removeTemplate)(req.params.id));
});
exports.templateRoutes = router;
