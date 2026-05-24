import { Router } from 'express';
import { dealRoutes } from './controllers/deal.routes';
import { pipelineSettingsRoutes } from './controllers/pipeline-settings.routes';

const router = Router();
router.use(pipelineSettingsRoutes);
router.use(dealRoutes);

export const salesRoutes = router;

