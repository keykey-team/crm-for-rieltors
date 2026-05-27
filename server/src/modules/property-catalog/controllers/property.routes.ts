import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody } from '../../../common/validation/middleware';
import { createPropertySchema, updatePropertySchema, createPropertyUnitSchema, updatePropertyUnitSchema } from './property.schemas';
import {
  addProperty,
  addPropertyUnit,
  changeProperty,
  changePropertyUnit,
  listProperties,
  listPropertyUnits,
  removeProperty,
  removePropertyUnit,
} from '../services/property.service';

const router = createAsyncRouter();

router.get('/properties', async (req, res) => {
  res.json(
    await listProperties({
      search: typeof req.query.search === 'string' ? req.query.search : '',
      status: typeof req.query.status === 'string' ? req.query.status : '',
      type: typeof req.query.type === 'string' ? req.query.type : '',
    }),
  );
});

router.post('/properties', validateBody(createPropertySchema), async (req, res) => {
  res.status(201).json(await addProperty(req.body));
});

router.put('/properties/:id', validateBody(updatePropertySchema), async (req, res) => {
  res.json(await changeProperty(req.params.id, req.body));
});

router.delete('/properties/:id', async (req, res) => {
  res.json(await removeProperty(req.params.id));
});

router.get('/property-units', async (req, res) => {
  res.json(await listPropertyUnits(req.query.propertyId));
});

router.post('/property-units', validateBody(createPropertyUnitSchema), async (req, res) => {
  res.status(201).json(await addPropertyUnit(req.body));
});

router.put('/property-units', validateBody(updatePropertyUnitSchema), async (req, res) => {
  res.json(await changePropertyUnit(req.body));
});

router.delete('/property-units', async (req, res) => {
  res.json(await removePropertyUnit(req.query.id));
});

export const propertyRoutes = router;
