"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.changeProfile = changeProfile;
exports.getBrandSettings = getBrandSettings;
exports.changeBrandSettings = changeBrandSettings;
exports.changePlan = changePlan;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("../../../common/shared-kernel/errors");
const account_repository_1 = require("../repositories/account.repository");
async function getProfile(userId) {
    return (0, account_repository_1.findProfile)(userId);
}
async function changeProfile(userId, input) {
    const data = {};
    if (input.name !== undefined)
        data.name = input.name;
    if (input.phone !== undefined)
        data.phone = input.phone;
    if (input.avatar !== undefined)
        data.avatar = input.avatar;
    const newPassword = String(input.newPassword ?? '');
    if (newPassword.length >= 6)
        data.password = await bcryptjs_1.default.hash(newPassword, 12);
    return (0, account_repository_1.updateProfile)(userId, data);
}
async function getBrandSettings(userId) {
    return (await (0, account_repository_1.findBrandSettings)(userId)) ?? {};
}
async function changeBrandSettings(userId, input) {
    const data = {};
    if (input.brandName !== undefined)
        data.brandName = input.brandName || null;
    if (input.brandLogo !== undefined)
        data.brandLogo = input.brandLogo || null;
    if (input.primaryColor !== undefined)
        data.primaryColor = input.primaryColor || null;
    if (input.themeMode !== undefined)
        data.themeMode = input.themeMode || 'light';
    if (input.sidebarGlass !== undefined)
        data.sidebarGlass = Boolean(input.sidebarGlass);
    if (input.sidebarOpacity !== undefined) {
        data.sidebarOpacity = typeof input.sidebarOpacity === 'number' ? input.sidebarOpacity : 1;
    }
    if (input.gradientBg !== undefined)
        data.gradientBg = Boolean(input.gradientBg);
    return (0, account_repository_1.updateBrandSettings)(userId, data);
}
async function changePlan(userId, input) {
    const plan = String(input.plan ?? '');
    if (!['free', 'pro', 'business'].includes(plan))
        throw (0, errors_1.badRequest)('Invalid plan');
    return (0, account_repository_1.updateSubscriptionPlan)(userId, plan);
}
