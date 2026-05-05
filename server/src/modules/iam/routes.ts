import { Router } from 'express';
import { container } from '../../common/di/container';
import { asyncHandler } from '../../common/errors';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { AuthController } from './controllers/AuthController';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.get('/session', authMiddleware, asyncHandler(authController.session));
router.post('/logout', asyncHandler(authController.logout));

export const iamRoutes = router;
