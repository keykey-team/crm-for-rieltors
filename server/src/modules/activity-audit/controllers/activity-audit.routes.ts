import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { listActivityLogs } from '../services/activity-log.service';

const router = createAsyncRouter();

router.get('/activity-log', async (req, res) => {
  res.json(
    await listActivityLogs({
      entityType: typeof req.query.entityType === 'string' ? req.query.entityType : '',
      entityId: typeof req.query.entityId === 'string' ? req.query.entityId : '',
    }),
  );
});

export const activityAuditRoutes = router;

