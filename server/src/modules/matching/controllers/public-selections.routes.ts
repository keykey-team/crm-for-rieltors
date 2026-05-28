import { Request } from 'express';
import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody } from '../../../common/validation/middleware';
import { reactionSchema } from './matching.schemas';
import { selectionsService } from '../services/selections.service';

const router = createAsyncRouter();
const RATE_LIMIT_WINDOW_MS = 60_000;
const REACTION_LIMIT = 30;
const reactionCounter = new Map<string, number[]>();
let requestsSinceCleanup = 0;

function readIp(req: Request) {
  return (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown';
}

function isReactionRateLimited(req: Request) {
  const now = Date.now();
  const key = `${readIp(req)}:${req.params.slug}`;
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 200) {
    requestsSinceCleanup = 0;
    for (const [mapKey, values] of reactionCounter.entries()) {
      const active = values.filter((item) => now - item < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) reactionCounter.delete(mapKey);
      else reactionCounter.set(mapKey, active);
    }
  }

  const history = reactionCounter.get(key) ?? [];
  const fresh = history.filter((item) => now - item < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= REACTION_LIMIT) return true;
  fresh.push(now);
  reactionCounter.set(key, fresh);
  return false;
}

router.get('/public/selections/:slug', async (req, res) => {
  res.json(await selectionsService.getBySlug(req.params.slug));
});

router.post('/public/selections/:slug/items/:itemId/reaction', validateBody(reactionSchema), async (req, res) => {
  if (isReactionRateLimited(req)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  res.status(201).json(await selectionsService.recordReaction(req.params.slug, req.params.itemId, req.body.reaction, req.body.clientNote));
});

export const publicSelectionsRoutes = router;
