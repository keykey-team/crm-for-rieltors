"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelineSettingsRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const middleware_1 = require("../../../common/validation/middleware");
const deal_schemas_1 = require("./deal.schemas");
const pipeline_settings_service_1 = require("../services/pipeline-settings.service");
const funnel_service_1 = require("../services/funnel.service");
const router = (0, async_handler_1.createAsyncRouter)();
// ── Funnels ───────────────────────────────────────────────────────────────────
router.get('/funnels', async (_req, res) => res.json(await (0, funnel_service_1.listFunnels)()));
router.post('/funnels', (0, middleware_1.validateBody)(deal_schemas_1.createFunnelSchema), async (req, res) => res.status(201).json(await (0, funnel_service_1.addFunnel)(req.body)));
router.put('/funnels/:id', (0, middleware_1.validateBody)(deal_schemas_1.updateFunnelSchema), async (req, res) => res.json(await (0, funnel_service_1.changeFunnel)({ id: req.params.id, ...req.body })));
router.delete('/funnels/:id', async (req, res) => res.json(await (0, funnel_service_1.removeFunnel)(req.params.id)));
// ── Funnel stages ─────────────────────────────────────────────────────────────
router.get('/funnel-stages', async (req, res) => res.json(await (0, pipeline_settings_service_1.listFunnelStages)(req.query.funnelId)));
router.post('/funnel-stages', (0, middleware_1.validateBody)(deal_schemas_1.addFunnelStageSchema), async (req, res) => res.status(201).json(await (0, pipeline_settings_service_1.addFunnelStage)(req.body)));
router.put('/funnel-stages', (0, middleware_1.validateBody)(deal_schemas_1.updateFunnelStagesSchema), async (req, res) => res.json(await (0, pipeline_settings_service_1.changeFunnelStages)(req.body)));
router.delete('/funnel-stages', async (req, res) => res.json(await (0, pipeline_settings_service_1.removeFunnelStage)(req.query.id)));
// ── Deal custom fields ────────────────────────────────────────────────────────
router.get('/deal-custom-fields', async (_req, res) => res.json(await (0, pipeline_settings_service_1.listDealCustomFields)()));
router.post('/deal-custom-fields', (0, middleware_1.validateBody)(deal_schemas_1.addDealCustomFieldSchema), async (req, res) => res.status(201).json(await (0, pipeline_settings_service_1.addDealCustomField)(req.body)));
router.put('/deal-custom-fields', (0, middleware_1.validateBody)(deal_schemas_1.updateDealCustomFieldsSchema), async (req, res) => res.json(await (0, pipeline_settings_service_1.changeDealCustomFields)(req.body)));
router.delete('/deal-custom-fields', async (req, res) => res.json(await (0, pipeline_settings_service_1.removeDealCustomField)(req.query.id)));
router.get('/deals/custom-field-values', async (req, res) => res.json(await (0, pipeline_settings_service_1.listDealCustomFieldValues)(req.query.dealId)));
router.post('/deals/custom-field-values', (0, middleware_1.validateBody)(deal_schemas_1.saveCustomFieldValueSchema), async (req, res) => res.json(await (0, pipeline_settings_service_1.saveDealCustomFieldValue)(req.body)));
exports.pipelineSettingsRoutes = router;
