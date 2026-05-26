import { prisma } from '../../../common/infrastructure/db/prisma';

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

export async function findProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id: userId },
    data: data as any,
    select: profileSelect,
  });
}

export async function findBrandSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: brandSelect,
  });
}

export async function updateBrandSettings(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id: userId },
    data: data as any,
    select: brandSelect,
  });
}

export async function updateSubscriptionPlan(userId: string, plan: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      ...(plan === 'business' ? { accountType: 'agency' } : {}),
    },
    select: { plan: true, accountType: true },
  });
}

