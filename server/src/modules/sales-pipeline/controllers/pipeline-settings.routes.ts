import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
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

const router = createAsyncRouter();

router.get('/funnel-stages', async (_req, res) => res.json(await listFunnelStages()));
router.post('/funnel-stages', async (req, res) => res.status(201).json(await addFunnelStage(req.body ?? {})));
router.put('/funnel-stages', async (req, res) => res.json(await changeFunnelStages(req.body ?? {})));
router.delete('/funnel-stages', async (req, res) => res.json(await removeFunnelStage(req.query.id)));

router.get('/deal-custom-fields', async (_req, res) => res.json(await listDealCustomFields()));
router.post('/deal-custom-fields', async (req, res) => res.status(201).json(await addDealCustomField(req.body ?? {})));
router.put('/deal-custom-fields', async (req, res) => res.json(await changeDealCustomFields(req.body ?? {})));
router.delete('/deal-custom-fields', async (req, res) => res.json(await removeDealCustomField(req.query.id)));

router.get('/deals/custom-field-values', async (req, res) => res.json(await listDealCustomFieldValues(req.query.dealId)));
router.post('/deals/custom-field-values', async (req, res) => res.json(await saveDealCustomFieldValue(req.body ?? {})));

export const pipelineSettingsRoutes = router;

