import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addArticle, changeArticle, listArticles, removeArticle } from '../services/knowledge-base.service';

const router = createAsyncRouter();

router.get('/knowledge-base', async (req, res) => {
  res.json(
    await listArticles({
      search: typeof req.query.search === 'string' ? req.query.search : '',
      category: typeof req.query.category === 'string' ? req.query.category : '',
    }),
  );
});

router.post('/knowledge-base', async (req, res) => {
  res.status(201).json(await addArticle(req.user?.id, req.body ?? {}));
});

router.put('/knowledge-base/:id', async (req, res) => {
  res.json(await changeArticle(req.params.id, req.body ?? {}));
});

router.delete('/knowledge-base/:id', async (req, res) => {
  res.json(await removeArticle(req.params.id));
});

export const knowledgeBaseRoutes = router;

