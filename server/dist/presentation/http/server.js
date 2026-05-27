"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("../../configuration/env");
const error_handler_1 = require("../../common/infrastructure/http/error-handler");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    if (env_1.env.clientUrls.includes(origin))
        return true;
    return env_1.env.nodeEnv === 'development' && /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin);
}
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use('/api', routes_1.routes);
app.use(error_handler_1.errorHandler);
app.listen(env_1.env.port, () => {
    console.log(`CRM server listening on http://localhost:${env_1.env.port}`);
});
