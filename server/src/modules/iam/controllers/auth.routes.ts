import { Response } from 'express';
import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { authMiddleware } from '../../../common/infrastructure/middleware/auth.middleware';
import { env } from '../../../configuration/env';
import { getSessionUser, login, signup } from '../services/auth.service';

const AUTH_COOKIE_NAME = 'crm_token';
const router = createAsyncRouter();

function cookieOptions() {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    secure: isProd,
    path: '/',
  };
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post('/login', async (req, res) => {
  const result = await login(req.body ?? {});
  setSessionCookie(res, result.token);
  const includeToken = req.get('x-return-session-token') === 'true';
  res.json(includeToken ? { ...result.user, backendToken: result.token } : result.user);
});

router.post('/signup', async (req, res) => {
  res.status(201).json(await signup(req.body ?? {}));
});

router.get('/session', authMiddleware, async (req, res) => {
  res.json(await getSessionUser(req.user!.id));
});

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
  res.json({ success: true });
});

export const iamRoutes = router;

