import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody } from '../../../common/validation/middleware';
import {
  createPropertyPricePointSchema,
  createPropertySchema,
  createPropertyUnitSchema,
  updatePropertySchema,
  updatePropertyUnitSchema,
} from './property.schemas';
import {
  addProperty,
  addPropertyUnit,
  changeProperty,
  changePropertyUnit,
  createPropertyPriceHistoryPoint,
  getPropertyPriceStats,
  listPropertyPriceHistory,
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
      dealType: typeof req.query.dealType === 'string' ? req.query.dealType : '',
    }),
  );
});

router.post('/properties', validateBody(createPropertySchema), async (req, res) => {
  res.status(201).json(await addProperty(req.body, req.user?.id));
});

router.put('/properties/:id', validateBody(updatePropertySchema), async (req, res) => {
  res.json(await changeProperty(req.params.id, req.body, req.user?.id));
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

router.get('/properties/:id/price-history', async (req, res) => {
  res.json(
    await listPropertyPriceHistory(req.params.id, {
      page: req.query.page,
      limit: req.query.limit,
      from: req.query.from,
      to: req.query.to,
    }),
  );
});

router.post('/properties/:id/price-history', validateBody(createPropertyPricePointSchema), async (req, res) => {
  res
    .status(201)
    .json(await createPropertyPriceHistoryPoint(req.params.id, req.body, req.user?.id, req.user?.role));
});

router.get('/properties/:id/price-stats', async (req, res) => {
  res.json(await getPropertyPriceStats(req.params.id));
});

export const propertyRoutes = router;
