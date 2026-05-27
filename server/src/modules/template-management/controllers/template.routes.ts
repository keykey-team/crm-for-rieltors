import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addTemplate, changeTemplate, listTemplates, removeTemplate } from '../services/template.service';
import { validateBody } from '../../../common/validation/middleware';
import { createTemplateSchema, updateTemplateSchema } from './template.schemas';

const router = createAsyncRouter();

router.get('/templates', async (req, res) => {
  const type = typeof req.query.type === 'string' ? req.query.type : '';
  res.json(await listTemplates(type));
});

router.post('/templates', validateBody(createTemplateSchema), async (req, res) => {
  res.status(201).json(await addTemplate(req.user?.id, req.body));
});

router.put('/templates/:id', validateBody(updateTemplateSchema), async (req, res) => {
  res.json(await changeTemplate(req.params.id, req.body));
});

router.delete('/templates/:id', async (req, res) => {
  res.json(await removeTemplate(req.params.id));
});

export const templateRoutes = router;

