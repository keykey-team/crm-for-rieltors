import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody } from '../../../common/validation/middleware';
import {
  addFunnelStageSchema,
  updateFunnelStagesSchema,
  addDealCustomFieldSchema,
  updateDealCustomFieldsSchema,
  saveCustomFieldValueSchema,
  createFunnelSchema,
  updateFunnelSchema,
} from './deal.schemas';
import {
  addDealCustomField,
  addFunnelStage,
  changeDealCustomFields,
  changeFunnelStages,
  listDealCustomFields,
  listDealCustomFieldValues,
  listFunnelStages,
  removeDealCustomField,
  removeFunnelStage,
  saveDealCustomFieldValue,
} from '../services/pipeline-settings.service';
import { addFunnel, changeFunnel, listFunnels, removeFunnel } from '../services/funnel.service';

const router = createAsyncRouter();

// ── Funnels ───────────────────────────────────────────────────────────────────
router.get('/funnels', async (_req, res) => res.json(await listFunnels()));
router.post('/funnels', validateBody(createFunnelSchema), async (req, res) => res.status(201).json(await addFunnel(req.body)));
router.put('/funnels/:id', validateBody(updateFunnelSchema), async (req, res) => res.json(await changeFunnel({ id: req.params.id, ...req.body })));
router.delete('/funnels/:id', async (req, res) => res.json(await removeFunnel(req.params.id)));

// ── Funnel stages ─────────────────────────────────────────────────────────────
router.get('/funnel-stages', async (req, res) => res.json(await listFunnelStages(req.query.funnelId as string | undefined)));
router.post('/funnel-stages', validateBody(addFunnelStageSchema), async (req, res) => res.status(201).json(await addFunnelStage(req.body)));
router.put('/funnel-stages', validateBody(updateFunnelStagesSchema), async (req, res) => res.json(await changeFunnelStages(req.body)));
router.delete('/funnel-stages', async (req, res) => res.json(await removeFunnelStage(req.query.id)));

// ── Deal custom fields ────────────────────────────────────────────────────────
router.get('/deal-custom-fields', async (_req, res) => res.json(await listDealCustomFields()));
router.post('/deal-custom-fields', validateBody(addDealCustomFieldSchema), async (req, res) => res.status(201).json(await addDealCustomField(req.body)));
router.put('/deal-custom-fields', validateBody(updateDealCustomFieldsSchema), async (req, res) => res.json(await changeDealCustomFields(req.body)));
router.delete('/deal-custom-fields', async (req, res) => res.json(await removeDealCustomField(req.query.id)));

router.get('/deals/custom-field-values', async (req, res) => res.json(await listDealCustomFieldValues(req.query.dealId)));
router.post('/deals/custom-field-values', validateBody(saveCustomFieldValueSchema), async (req, res) => res.json(await saveDealCustomFieldValue(req.body)));

export const pipelineSettingsRoutes = router;
