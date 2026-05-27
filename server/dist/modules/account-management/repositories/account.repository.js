"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProfile = findProfile;
exports.updateProfile = updateProfile;
exports.findBrandSettings = findBrandSettings;
exports.updateBrandSettings = updateBrandSettings;
exports.updateSubscriptionPlan = updateSubscriptionPlan;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
const profileSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    avatar: true,
    createdAt: true,
};
const brandSelect = {
    brandName: true,
    brandLogo: true,
    primaryColor: true,
    themeMode: true,
    sidebarGlass: true,
    sidebarOpacity: true,
    gradientBg: true,
};
async function findProfile(userId) {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: profileSelect,
    });
}
async function updateProfile(userId, data) {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: data,
        select: profileSelect,
    });
}
async function findBrandSettings(userId) {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: brandSelect,
    });
}
async function updateBrandSettings(userId, data) {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: data,
        select: brandSelect,
    });
}
async function updateSubscriptionPlan(userId, plan) {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            plan,
            ...(plan === 'business' ? { accountType: 'agency' } : {}),
        },
        select: { plan: true, accountType: true },
    });
}
