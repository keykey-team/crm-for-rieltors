"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const auth_middleware_1 = require("../../../common/infrastructure/middleware/auth.middleware");
const env_1 = require("../../../configuration/env");
const auth_service_1 = require("../services/auth.service");
const middleware_1 = require("../../../common/validation/middleware");
const iam_schemas_1 = require("./iam.schemas");
const AUTH_COOKIE_NAME = 'crm_token';
const router = (0, async_handler_1.createAsyncRouter)();
function cookieOptions() {
    const isProd = env_1.env.nodeEnv === 'production';
    return {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        path: '/',
    };
}
function setSessionCookie(res, token) {
    res.cookie(AUTH_COOKIE_NAME, token, {
        ...cookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
router.post('/login', (0, middleware_1.validateBody)(iam_schemas_1.loginSchema), async (req, res) => {
    const result = await (0, auth_service_1.login)(req.body ?? {});
    setSessionCookie(res, result.token);
    const includeToken = req.get('x-return-session-token') === 'true';
    res.json(includeToken ? { ...result.user, backendToken: result.token } : result.user);
});
router.post('/signup', (0, middleware_1.validateBody)(iam_schemas_1.signupSchema), async (req, res) => {
    res.status(201).json(await (0, auth_service_1.signup)(req.body ?? {}));
});
router.get('/session', auth_middleware_1.authMiddleware, async (req, res) => {
    res.json(await (0, auth_service_1.getSessionUser)(req.user.id));
});
router.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
    res.json({ success: true });
});
exports.iamRoutes = router;
