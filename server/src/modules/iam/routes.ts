import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../common/infrastructure/db/prisma';
import { env } from '../../app/config/env';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

function withAsyncGuard(handler: any): any {
  if (Array.isArray(handler)) return handler.map(withAsyncGuard);
  if (typeof handler !== 'function' || handler.length === 4) return handler;
  return (req: any, res: any, next: any) => {
    try {
      const out = handler(req, res, next);
      if (out && typeof out.then === 'function') out.catch(next);
    } catch (err) {
      next(err);
    }
  };
}

(['get', 'post', 'put', 'delete', 'patch'] as const).forEach((method) => {
  const original = (router as any)[method].bind(router);
  (router as any)[method] = (path: any, ...handlers: any[]) =>
    original(path, ...handlers.map(withAsyncGuard));
});

const AUTH_COOKIE_NAME = 'crm_token';

function cookieOpts() {
  const isProd = env.nodeEnv === 'production';
  return { httpOnly: true, sameSite: isProd ? ('none' as const) : ('lax' as const), secure: isProd, path: '/' };
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(String(password ?? ''), user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
  res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOpts(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: user.accountType,
    plan: user.plan,
    permissions: user.permissions,
  });
});

router.post('/signup', async (req, res) => {
  const { email, password, name, accountType } = req.body ?? {};

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const exists = await prisma.user.findUnique({ where: { email: String(email) } });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(String(password), 12);
  const validAccountType = accountType === 'agency' ? 'agency' : 'agent';
  const defaultRole = validAccountType === 'agency' ? 'admin' : 'agent';

  const user = await prisma.user.create({
    data: {
      email: String(email),
      password: hashed,
      name: name ? String(name) : String(email).split('@')[0],
      role: defaultRole,
      accountType: validAccountType,
      plan: 'free',
    },
  });

  res.status(201).json({ id: user.id, email: user.email });
});

router.get('/session', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true, accountType: true, plan: true, permissions: true },
  });
  res.json(user);
});

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOpts());
  res.json({ success: true });
});

export const iamRoutes = router;
