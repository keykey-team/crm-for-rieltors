import { Router } from 'express';
import { container } from '../../common/di/container';
import { asyncHandler } from '../../common/errors';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { LeadsController } from './controllers/LeadsController';

const router = Router();
const leadsController = container.resolve(LeadsController);

router.get('/', authMiddleware, asyncHandler(leadsController.getAll));
router.get('/:id', authMiddleware, asyncHandler(leadsController.getOne));
router.post('/', authMiddleware, asyncHandler(leadsController.create));
router.put('/:id', authMiddleware, asyncHandler(leadsController.update));
router.delete('/:id', authMiddleware, asyncHandler(leadsController.remove));

export const leadsRoutes = router;
