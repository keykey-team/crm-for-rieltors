import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  addDeal,
  addDealChecklistItem,
  addDealComment,
  changeDeal,
  changeDealChecklistItem,
  convertLeadToDeal,
  getDeal,
  listDealChecklist,
  listDealComments,
  listDeals,
  removeDeal,
} from '../services/deal.service';

const router = createAsyncRouter();

router.post('/leads/:id/create-deal', async (req, res) => res.status(201).json(await convertLeadToDeal(req.params.id, req.body ?? {}, req.user?.id)));

router.get('/deals/:id/comments', async (req, res) => res.json(await listDealComments(req.params.id)));
router.post('/deals/:id/comments', async (req, res) => res.status(201).json(await addDealComment(req.params.id, req.body?.text, req.user?.id)));

router.get('/deals/:id/checklist', async (req, res) => res.json(await listDealChecklist(req.params.id)));
router.post('/deals/:id/checklist', async (req, res) => res.status(201).json(await addDealChecklistItem(req.params.id, req.body ?? {})));
router.put('/deals/:id/checklist', async (req, res) => res.json(await changeDealChecklistItem(req.body ?? {})));

router.get('/deals', async (req, res) => res.json(await listDeals(req.user?.id, req.user?.role)));
router.post('/deals', async (req, res) => res.status(201).json(await addDeal(req.body ?? {}, req.user?.id)));
router.get('/deals/:id', async (req, res) => res.json(await getDeal(req.params.id)));
router.put('/deals/:id', async (req, res) => res.json(await changeDeal(req.params.id, req.body ?? {})));
router.delete('/deals/:id', async (req, res) => res.json(await removeDeal(req.params.id)));

export const dealRoutes = router;

