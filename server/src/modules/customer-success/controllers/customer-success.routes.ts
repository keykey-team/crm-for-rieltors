import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  addAftercarePlan,
  changeAftercarePlan,
  listAftercarePlans,
  removeAftercarePlan,
  reorderAftercarePlans,
} from '../services/aftercare.service';

const router = createAsyncRouter();

router.get('/aftercare-plans', async (_req, res) => {
  res.json(await listAftercarePlans());
});

router.put('/aftercare-plans', async (req, res) => {
  res.json(await reorderAftercarePlans(req.body ?? {}));
});

router.post('/aftercare-plans', async (req, res) => {
  res.status(201).json(await addAftercarePlan(req.body ?? {}));
});

router.put('/aftercare-plans/:id', async (req, res) => {
  res.json(await changeAftercarePlan(req.params.id, req.body ?? {}));
});

router.delete('/aftercare-plans/:id', async (req, res) => {
  res.json(await removeAftercarePlan(req.params.id));
});

export const customerSuccessRoutes = router;

