import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  addEvent,
  buildIcsFeed,
  changeEvent,
  generateCalendarToken,
  getCalendarToken,
  listEvents,
  removeCalendarToken,
  removeEvent,
} from '../services/calendar.service';

const router = createAsyncRouter();

router.get('/events', async (req, res) => {
  res.json(await listEvents(typeof req.query.month === 'string' ? req.query.month : '', typeof req.query.year === 'string' ? req.query.year : ''));
});

router.post('/events', async (req, res) => {
  res.status(201).json(await addEvent(req.user?.id, req.body ?? {}));
});

router.put('/events/:id', async (req, res) => {
  res.json(await changeEvent(req.params.id, req.body ?? {}));
});

router.delete('/events/:id', async (req, res) => {
  res.json(await removeEvent(req.params.id));
});

router.get('/calendar/token', async (req, res) => {
  res.json(await getCalendarToken(req.user!.id));
});

router.post('/calendar/token', async (req, res) => {
  res.json(await generateCalendarToken(req.user!.id));
});

router.delete('/calendar/token', async (req, res) => {
  res.json(await removeCalendarToken(req.user!.id));
});

router.get('/calendar/ics', async (req, res) => {
  const feed = await buildIcsFeed(typeof req.query.token === 'string' ? req.query.token : '');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="freemor-calendar.ics"');
  res.send(feed);
});

export const calendarRoutes = router;

