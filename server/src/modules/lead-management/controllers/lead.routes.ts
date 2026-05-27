import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { bulkLeadAction, addLead, changeLead, getLead, listLeads, removeLead } from '../services/lead.service';
import { importLeads } from '../services/lead-import.service';
import {
  addLeadDistributionRule,
  changeLeadDistributionRule,
  listLeadDistributionRules,
  removeLeadDistributionRule,
} from '../services/lead-distribution.service';
import { validateBody } from '../../../common/validation/middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  bulkLeadSchema,
  importLeadsSchema,
  createDistributionRuleSchema,
  updateDistributionRuleSchema,
  createCommunicationSchema,
} from './lead.schemas';

const router = createAsyncRouter();

router.get('/lead-distribution', async (_req, res) => res.json(await listLeadDistributionRules()));
router.post('/lead-distribution', validateBody(createDistributionRuleSchema), async (req, res) => res.status(201).json(await addLeadDistributionRule(req.body)));
router.put('/lead-distribution', validateBody(updateDistributionRuleSchema), async (req, res) => res.json(await changeLeadDistributionRule(req.body)));
router.delete('/lead-distribution', async (req, res) => res.json(await removeLeadDistributionRule(req.query.id)));

router.get('/leads', async (req, res) => {
  res.json(
    await listLeads(
      {
        search: typeof req.query.search === 'string' ? req.query.search : '',
        status: typeof req.query.status === 'string' ? req.query.status : '',
        source: typeof req.query.source === 'string' ? req.query.source : '',
        managerId: typeof req.query.managerId === 'string' ? req.query.managerId : '',
      },
      req.user?.id,
      req.user?.role,
    ),
  );
});

router.post('/leads', validateBody(createLeadSchema), async (req, res) => res.status(201).json(await addLead(req.body, req.user?.id)));
router.get('/leads/:id', async (req, res) => res.json(await getLead(req.params.id, req.user?.id, req.user?.role)));
router.put('/leads/:id', validateBody(updateLeadSchema), async (req, res) => res.json(await changeLead(req.params.id, req.body, req.user?.id, req.user?.role)));
router.delete('/leads/:id', async (req, res) => res.json(await removeLead(req.params.id)));
router.post('/leads/bulk', validateBody(bulkLeadSchema), async (req, res) => res.json(await bulkLeadAction(req.body, req.user?.id, req.user?.role)));
router.post('/leads/import', validateBody(importLeadsSchema), async (req, res) => res.json(await importLeads(req.body, req.user?.id)));

export const leadRoutes = router;

