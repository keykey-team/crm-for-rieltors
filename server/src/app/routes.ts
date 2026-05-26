import { Router } from 'express';
import { iamRoutes } from '../modules/iam/routes';
import { systemRoutes } from '../modules/system/routes';

const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
apiRouter.use('/auth', iamRoutes);
apiRouter.use('/iam', iamRoutes);
apiRouter.use(systemRoutes);

export const routes = apiRouter;
