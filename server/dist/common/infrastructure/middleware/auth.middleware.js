"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../configuration/env");
function authMiddleware(req, res, next) {
    const token = req.cookies?.crm_token;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid session token' });
    }
}
