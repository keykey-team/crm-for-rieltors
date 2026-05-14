"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const routes_1 = require("./routes");
const error_handler_1 = require("../common/errors/error-handler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: env_1.env.clientUrl, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use('/api', routes_1.routes);
app.use(error_handler_1.errorHandler);
app.listen(env_1.env.port, () => {
    console.log(`CRM server listening on http://localhost:${env_1.env.port}`);
});
