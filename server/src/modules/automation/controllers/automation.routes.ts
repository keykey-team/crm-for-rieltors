import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addAutomation, changeAutomation, listAutomations, removeAutomation } from '../services/automation.service';
import { validateBody } from '../../../common/validation/middleware';
import { createAutomationSchema, updateAutomationSchema } from './automation.schemas';

const router = createAsyncRouter();

router.get('/automations', async (_req, res) => {
  res.json(await listAutomations());
});

router.post('/automations', validateBody(createAutomationSchema), async (req, res) => {
  res.status(201).json(await addAutomation(req.user?.id, req.body));
});

router.put('/automations/:id', validateBody(updateAutomationSchema), async (req, res) => {
  res.json(await changeAutomation(req.params.id, req.body));
});

router.delete('/automations/:id', async (req, res) => {
  res.json(await removeAutomation(req.params.id));
});

export const automationRoutes = router;

