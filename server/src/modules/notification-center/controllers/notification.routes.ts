import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { getNotifications } from '../services/notification.service';

const router = createAsyncRouter();

router.get('/notifications', async (req, res) => {
  res.json(await getNotifications(req.user?.id, req.user?.role));
});

export const notificationRoutes = router;
