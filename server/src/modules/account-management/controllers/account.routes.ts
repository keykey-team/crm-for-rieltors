import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { changeBrandSettings, changePlan, changeProfile, getBrandSettings, getProfile } from '../services/account.service';
import { validateBody } from '../../../common/validation/middleware';
import { updateProfileSchema, updateBrandSchema, changePlanSchema } from './account.schemas';

const router = createAsyncRouter();

router.get('/settings/profile', async (req, res) => {
  res.json(await getProfile(req.user!.id));
});

router.put('/settings/profile', validateBody(updateProfileSchema), async (req, res) => {
  res.json(await changeProfile(req.user!.id, req.body));
});

router.get('/settings/brand', async (req, res) => {
  res.json(await getBrandSettings(req.user!.id));
});

router.put('/settings/brand', validateBody(updateBrandSchema), async (req, res) => {
  res.json(await changeBrandSettings(req.user!.id, req.body));
});

router.put('/users/plan', validateBody(changePlanSchema), async (req, res) => {
  res.json(await changePlan(req.user!.id, req.body));
});

export const accountRoutes = router;
