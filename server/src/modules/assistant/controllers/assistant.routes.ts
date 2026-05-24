import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { getHelperSummary, receiveAssistantMessage, receiveHelperMessage } from '../services/assistant.service';

const router = createAsyncRouter();

router.get('/helper', async (req, res) => {
  res.json(await getHelperSummary(req.user!.id));
});

router.post('/helper', async (req, res) => {
  res.json(await receiveHelperMessage(req.user!.id, req.body?.message));
});

router.post('/assistant', async (req, res) => {
  res.json(await receiveAssistantMessage(req.user!.id, req.body?.message));
});

export const assistantRoutes = router;
