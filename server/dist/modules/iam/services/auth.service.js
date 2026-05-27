"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.signup = signup;
exports.getSessionUser = getSessionUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../../../common/shared-kernel/errors");
const env_1 = require("../../../configuration/env");
const user_repository_1 = require("../repositories/user.repository");
function normalizeRequiredString(value, field) {
    const normalized = String(value ?? '').trim();
    if (!normalized)
        throw (0, errors_1.badRequest)(`${field} is required`);
    return normalized;
}
async function login(input) {
    const email = normalizeRequiredString(input.email, 'Email');
    const password = String(input.password ?? '');
    const user = await (0, user_repository_1.findUserCredentialsByEmail)(email);
    const passwordMatches = user ? await bcryptjs_1.default.compare(password, user.password) : false;
    if (!user || !passwordMatches)
        throw (0, errors_1.unauthorized)('Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.env.jwtSecret, { expiresIn: '7d' });
    const { password: _password, ...publicUser } = user;
    return { token, user: publicUser };
}
async function signup(input) {
    const email = normalizeRequiredString(input.email, 'Email');
    const password = normalizeRequiredString(input.password, 'Password');
    if (await (0, user_repository_1.findUserIdByEmail)(email))
        throw (0, errors_1.conflict)('User already exists');
    const accountType = input.accountType === 'agency' ? 'agency' : 'agent';
    const role = accountType === 'agency' ? 'admin' : 'agent';
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const name = String(input.name ?? '').trim() || email.split('@')[0];
    return (0, user_repository_1.createUser)({
        email,
        password: hashedPassword,
        name,
        role,
        accountType,
        plan: 'free',
    });
}
async function getSessionUser(userId) {
    return (0, user_repository_1.findPublicUserById)(userId);
}
