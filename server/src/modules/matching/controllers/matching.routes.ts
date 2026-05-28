import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { suggestPropertiesForLead } from '../services/matching.service';

const router = createAsyncRouter();

router.get('/leads/:id/matches', async (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  res.json(await suggestPropertiesForLead(req.params.id, limit));
});

export const matchingRoutes = router;
