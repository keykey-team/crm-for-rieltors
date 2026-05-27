"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const lead_service_1 = require("../services/lead.service");
const lead_import_service_1 = require("../services/lead-import.service");
const lead_distribution_service_1 = require("../services/lead-distribution.service");
const middleware_1 = require("../../../common/validation/middleware");
const lead_schemas_1 = require("./lead.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/lead-distribution', async (_req, res) => res.json(await (0, lead_distribution_service_1.listLeadDistributionRules)()));
router.post('/lead-distribution', (0, middleware_1.validateBody)(lead_schemas_1.createDistributionRuleSchema), async (req, res) => res.status(201).json(await (0, lead_distribution_service_1.addLeadDistributionRule)(req.body)));
router.put('/lead-distribution', (0, middleware_1.validateBody)(lead_schemas_1.updateDistributionRuleSchema), async (req, res) => res.json(await (0, lead_distribution_service_1.changeLeadDistributionRule)(req.body)));
router.delete('/lead-distribution', async (req, res) => res.json(await (0, lead_distribution_service_1.removeLeadDistributionRule)(req.query.id)));
router.get('/leads', async (req, res) => {
    res.json(await (0, lead_service_1.listLeads)({
        search: typeof req.query.search === 'string' ? req.query.search : '',
        status: typeof req.query.status === 'string' ? req.query.status : '',
        source: typeof req.query.source === 'string' ? req.query.source : '',
        managerId: typeof req.query.managerId === 'string' ? req.query.managerId : '',
    }, req.user?.id, req.user?.role));
});
router.post('/leads', (0, middleware_1.validateBody)(lead_schemas_1.createLeadSchema), async (req, res) => res.status(201).json(await (0, lead_service_1.addLead)(req.body, req.user?.id)));
router.get('/leads/:id', async (req, res) => res.json(await (0, lead_service_1.getLead)(req.params.id, req.user?.id, req.user?.role)));
router.put('/leads/:id', (0, middleware_1.validateBody)(lead_schemas_1.updateLeadSchema), async (req, res) => res.json(await (0, lead_service_1.changeLead)(req.params.id, req.body, req.user?.id, req.user?.role)));
router.delete('/leads/:id', async (req, res) => res.json(await (0, lead_service_1.removeLead)(req.params.id)));
router.post('/leads/bulk', (0, middleware_1.validateBody)(lead_schemas_1.bulkLeadSchema), async (req, res) => res.json(await (0, lead_service_1.bulkLeadAction)(req.body, req.user?.id, req.user?.role)));
router.post('/leads/import', (0, middleware_1.validateBody)(lead_schemas_1.importLeadsSchema), async (req, res) => res.json(await (0, lead_import_service_1.importLeads)(req.body, req.user?.id)));
exports.leadRoutes = router;
