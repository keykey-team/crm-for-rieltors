import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { validateBody, validateQuery } from '../../../common/validation/middleware';
import {
  addSelectionItemsSchema,
  createSelectionSchema,
  listSelectionsSchema,
  reorderSelectionItemsSchema,
  updateSelectionItemSchema,
  updateSelectionSchema,
} from './matching.schemas';
import { selectionsService } from '../services/selections.service';

const router = createAsyncRouter();

router.get('/selections', validateQuery(listSelectionsSchema), async (req, res) => {
  const leadId = typeof req.query.leadId === 'string' ? req.query.leadId : undefined;
  res.json(await selectionsService.listSelections(req.user!.id, leadId));
});

router.post('/selections', validateBody(createSelectionSchema), async (req, res) => {
  const selection = await selectionsService.createSelection(req.user!.id, req.body.leadId, req.body.propertyIds, {
    title: req.body.title,
    message: req.body.message,
    expiresAt: req.body.expiresAt,
    agencyId: req.agency?.agencyId,
  });
  res.status(201).json(selection);
});

router.put('/selections/:id', validateBody(updateSelectionSchema), async (req, res) => {
  res.json(await selectionsService.updateSelection(req.params.id, req.body, req.user?.id, req.user?.role));
});

router.delete('/selections/:id', async (req, res) => {
  res.json(await selectionsService.deleteSelection(req.params.id, req.user?.id, req.user?.role));
});

router.post('/selections/:id/items', validateBody(addSelectionItemsSchema), async (req, res) => {
  res.status(201).json(await selectionsService.addItems(req.params.id, req.body.propertyIds, req.user?.id, req.user?.role));
});

router.delete('/selections/:id/items/:itemId', async (req, res) => {
  res.json(await selectionsService.removeItem(req.params.id, req.params.itemId, req.user?.id, req.user?.role));
});

router.put('/selections/:id/items/reorder', validateBody(reorderSelectionItemsSchema), async (req, res) => {
  res.json(await selectionsService.reorderItems(req.params.id, req.body.items, req.user?.id, req.user?.role));
});

router.put('/selections/:id/items/:itemId', validateBody(updateSelectionItemSchema), async (req, res) => {
  res.json(await selectionsService.updateItemComment(req.params.id, req.params.itemId, req.body.agentComment ?? null, req.user?.id, req.user?.role));
});

router.get('/selections/:id/pdf', async (req, res) => {
  const pdf = await selectionsService.getSelectionPdf(req.params.id, req.user?.id, req.user?.role);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="selection-${req.params.id}.pdf"`);
  res.send(pdf);
});

export const selectionsRoutes = router;
