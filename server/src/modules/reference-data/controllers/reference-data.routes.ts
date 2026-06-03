import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addDictionary, changeDictionary, listDictionaries, removeDictionary } from '../services/dictionary.service';
import { validateBody } from '../../../common/validation/middleware';
import { createDictionarySchema, updateDictionarySchema } from './reference-data.schemas';

const router = createAsyncRouter();

router.get('/dictionaries', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const includeInactive =
    req.query.includeInactive === '1' ||
    req.query.includeInactive === 'true';
  res.json(await listDictionaries(req.agency!.agencyId, category, includeInactive));
});

router.post('/dictionaries', validateBody(createDictionarySchema), async (req, res) => {
  res.status(201).json(await addDictionary(req.body));
});

router.put('/dictionaries', validateBody(updateDictionarySchema), async (req, res) => {
  res.json(await changeDictionary(req.body));
});

router.delete('/dictionaries', async (req, res) => {
  res.json(await removeDictionary(req.query.id));
});

export const referenceDataRoutes = router;
