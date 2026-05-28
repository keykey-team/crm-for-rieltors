import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody } from '../../../common/validation/middleware';
import { badRequest } from '../../../common/shared-kernel/errors';
import {
  addShowing,
  changeShowing,
  getShowing,
  listDuplicates,
  listShowings,
  removeShowing,
} from '../services/showing.service';
import {
  createShowingSchema,
  duplicatesQuerySchema,
  listShowingsQuerySchema,
  updateShowingSchema,
} from './showing.schemas';

const router = createAsyncRouter();

router.get('/showings', async (req, res) => {
  const parsed = listShowingsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message || 'Invalid query');
  res.json(await listShowings(parsed.data as Record<string, unknown>, req.user?.id, req.user?.role, req.agency?.agencyId));
});

router.get('/showings/duplicates', async (req, res) => {
  const parsed = duplicatesQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message || 'Invalid query');
  res.json(await listDuplicates(parsed.data.propertyId, parsed.data.leadId, req.user?.id, req.user?.role, req.agency?.agencyId));
});

router.get('/showings/:id', async (req, res) => {
  res.json(await getShowing(req.params.id, req.user?.id, req.user?.role));
});

router.post('/showings', validateBody(createShowingSchema), async (req, res) => {
  res.status(201).json(await addShowing(req.body, req.user?.id, req.agency?.agencyId));
});

router.patch('/showings/:id', validateBody(updateShowingSchema), async (req, res) => {
  res.json(await changeShowing(req.params.id, req.body, req.user?.id, req.user?.role));
});

router.delete('/showings/:id', async (req, res) => {
  res.json(await removeShowing(req.params.id, req.user?.id, req.user?.role));
});

export const showingRoutes = router;
