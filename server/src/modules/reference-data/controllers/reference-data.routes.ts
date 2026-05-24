import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addDictionary, changeDictionary, listDictionaries, removeDictionary } from '../services/dictionary.service';

const router = createAsyncRouter();

router.get('/dictionaries', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  res.json(await listDictionaries(category));
});

router.post('/dictionaries', async (req, res) => {
  res.status(201).json(await addDictionary(req.body ?? {}));
});

router.put('/dictionaries', async (req, res) => {
  res.json(await changeDictionary(req.body ?? {}));
});

router.delete('/dictionaries', async (req, res) => {
  res.json(await removeDictionary(req.query.id));
});

export const referenceDataRoutes = router;
