import bcrypt from 'bcryptjs';
import { badRequest } from '../../../common/shared-kernel/errors';
import { UpdateBrandInput, UpdatePlanInput, UpdateProfileInput } from '../models/account.dto';
import {
  findBrandSettings,
  findProfile,
  updateBrandSettings,
  updateProfile,
  updateSubscriptionPlan,
} from '../repositories/account.repository';

export async function getProfile(userId: string) {
  return findProfile(userId);
}

export async function changeProfile(userId: string, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.avatar !== undefined) data.avatar = input.avatar;

  const newPassword = String(input.newPassword ?? '');
  if (newPassword.length >= 6) data.password = await bcrypt.hash(newPassword, 12);

  return updateProfile(userId, data);
}

export async function getBrandSettings(userId: string) {
  return (await findBrandSettings(userId)) ?? {};
}

export async function changeBrandSettings(userId: string, input: UpdateBrandInput) {
  const data: Record<string, unknown> = {};
  if (input.brandName !== undefined) data.brandName = input.brandName || null;
  if (input.brandLogo !== undefined) data.brandLogo = input.brandLogo || null;
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor || null;
  if (input.themeMode !== undefined) data.themeMode = input.themeMode || 'light';
  if (input.sidebarGlass !== undefined) data.sidebarGlass = Boolean(input.sidebarGlass);
  if (input.sidebarOpacity !== undefined) {
    data.sidebarOpacity = typeof input.sidebarOpacity === 'number' ? input.sidebarOpacity : 1;
  }
  if (input.gradientBg !== undefined) data.gradientBg = Boolean(input.gradientBg);

  return updateBrandSettings(userId, data);
}

export async function changePlan(userId: string, input: UpdatePlanInput) {
  const plan = String(input.plan ?? '');
  if (!['free', 'pro', 'business'].includes(plan)) throw badRequest('Invalid plan');
  return updateSubscriptionPlan(userId, plan);
}

