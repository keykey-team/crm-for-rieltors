"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const calendar_service_1 = require("../services/calendar.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/events', async (req, res) => {
    res.json(await (0, calendar_service_1.listEvents)(typeof req.query.month === 'string' ? req.query.month : '', typeof req.query.year === 'string' ? req.query.year : ''));
});
router.post('/events', async (req, res) => {
    res.status(201).json(await (0, calendar_service_1.addEvent)(req.user?.id, req.body ?? {}));
});
router.put('/events/:id', async (req, res) => {
    res.json(await (0, calendar_service_1.changeEvent)(req.params.id, req.body ?? {}));
});
router.delete('/events/:id', async (req, res) => {
    res.json(await (0, calendar_service_1.removeEvent)(req.params.id));
});
router.get('/calendar/token', async (req, res) => {
    res.json(await (0, calendar_service_1.getCalendarToken)(req.user.id));
});
router.post('/calendar/token', async (req, res) => {
    res.json(await (0, calendar_service_1.generateCalendarToken)(req.user.id));
});
router.delete('/calendar/token', async (req, res) => {
    res.json(await (0, calendar_service_1.removeCalendarToken)(req.user.id));
});
router.get('/calendar/ics', async (req, res) => {
    const feed = await (0, calendar_service_1.buildIcsFeed)(typeof req.query.token === 'string' ? req.query.token : '');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="freemor-calendar.ics"');
    res.send(feed);
});
exports.calendarRoutes = router;
