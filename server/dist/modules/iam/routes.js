"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../common/infrastructure/db/prisma");
const env_1 = require("../../app/config/env");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const router = (0, express_1.Router)();
function withAsyncGuard(handler) {
    if (Array.isArray(handler))
        return handler.map(withAsyncGuard);
    if (typeof handler !== 'function' || handler.length === 4)
        return handler;
    return (req, res, next) => {
        try {
            const out = handler(req, res, next);
            if (out && typeof out.then === 'function')
                out.catch(next);
        }
        catch (err) {
            next(err);
        }
    };
}
['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => original(path, ...handlers.map(withAsyncGuard));
});
const AUTH_COOKIE_NAME = 'crm_token';
function cookieOpts() {
    const isProd = env_1.env.nodeEnv === 'production';
    return { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/' };
}
router.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(String(password ?? ''), user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.env.jwtSecret, { expiresIn: '7d' });
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
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required' });
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: String(email) } });
    if (exists)
        return res.status(409).json({ error: 'User already exists' });
    const hashed = await bcryptjs_1.default.hash(String(password), 12);
    const validAccountType = accountType === 'agency' ? 'agency' : 'agent';
    const defaultRole = validAccountType === 'agency' ? 'admin' : 'agent';
    const user = await prisma_1.prisma.user.create({
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
router.get('/session', auth_middleware_1.authMiddleware, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, role: true, accountType: true, plan: true, permissions: true },
    });
    res.json(user);
});
router.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOpts());
    res.json({ success: true });
});
exports.iamRoutes = router;
