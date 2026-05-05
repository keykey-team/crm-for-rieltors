import { Router } from 'express';
import { iamRoutes } from '../modules/iam';
import { leadsRoutes } from '../modules/leads';
import { dealsRoutes } from '../modules/deals';
import { propertiesRoutes } from '../modules/properties';
import { tasksRoutes } from '../modules/tasks';
import { calendarRoutes } from '../modules/calendar';
import { analyticsRoutes } from '../modules/analytics';
import { automationRoutes } from '../modules/automation';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', iamRoutes);
apiRouter.use('/leads', leadsRoutes);
apiRouter.use('/deals', dealsRoutes);
apiRouter.use('/properties', propertiesRoutes);
apiRouter.use('/tasks', tasksRoutes);
apiRouter.use('/calendar', calendarRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/automation', automationRoutes);

export const routes = apiRouter;
