import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import {
  createAgencyWithOwner,
  deleteMembership,
  findAgencyById,
  findAgencyMembership,
  findUserByEmail,
  findUserMemberships,
  listAgencyMembers,
  setLastAgency,
  updateAgency,
  updateMembership,
  upsertMembership,
} from '../repositories/agency.repository';

const ADMIN_MEMBERSHIP_ROLES = new Set(['owner', 'admin']);

function normalizeSlug(value: unknown): string {
  const source = String(value ?? '').toLowerCase().trim();
  let slug = '';
  let lastDash = false;
  for (const char of source) {
    const isAlphaNum = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');
    if (isAlphaNum) {
      slug += char;
      lastDash = false;
      continue;
    }
    if (!lastDash) slug += '-';
    lastDash = true;
  }
  while (slug.startsWith('-')) slug = slug.slice(1);
  while (slug.endsWith('-')) slug = slug.slice(0, -1);
  return slug;
}

async function assertManageAccess(agencyId: string, userId: string) {
  const membership = await findAgencyMembership(userId, agencyId);
  if (!membership?.isActive || !ADMIN_MEMBERSHIP_ROLES.has(membership.role)) throw forbidden();
}

export async function listMyAgencies(userId: string) {
  const memberships = await findUserMemberships(userId);
  return memberships.map((membership) => ({
    id: membership.agency.id,
    name: membership.agency.name,
    slug: membership.agency.slug,
    role: membership.role,
    plan: membership.agency.plan,
    brandLogo: membership.agency.brandLogo,
    brandName: membership.agency.brandName,
    primaryColor: membership.agency.primaryColor,
  }));
}

export async function createAgency(input: Record<string, unknown>, userId: string) {
  const name = String(input.name ?? '').trim();
  const slug = normalizeSlug(input.slug ?? name);
  if (!name) throw badRequest('Agency name is required');
  if (!slug) throw badRequest('Agency slug is required');
  return createAgencyWithOwner({ userId, name, slug });
}

export async function patchAgency(agencyId: string, input: Record<string, unknown>, userId: string) {
  await assertManageAccess(agencyId, userId);
  return updateAgency(agencyId, {
    ...(input.name !== undefined ? { name: String(input.name).trim() } : {}),
    ...(input.slug !== undefined ? { slug: normalizeSlug(input.slug) } : {}),
    ...(input.brandLogo !== undefined ? { brandLogo: input.brandLogo || null } : {}),
    ...(input.brandName !== undefined ? { brandName: input.brandName || null } : {}),
    ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor || null } : {}),
  });
}

export async function switchAgency(agencyId: string, userId: string) {
  const membership = await findAgencyMembership(userId, agencyId);
  if (!membership?.isActive) throw forbidden();
  await setLastAgency(userId, agencyId);
  const agency = await findAgencyById(agencyId);
  return { agencyId, agencyName: agency?.name ?? 'Agency' };
}

export async function getAgencyMembers(agencyId: string, userId: string) {
  await assertManageAccess(agencyId, userId);
  return listAgencyMembers(agencyId);
}

export async function inviteAgencyMember(agencyId: string, input: Record<string, unknown>, userId: string) {
  await assertManageAccess(agencyId, userId);
  const email = String(input.email ?? '').trim().toLowerCase();
  if (!email) throw badRequest('Email is required');
  const role = String(input.role ?? 'agent').trim() || 'agent';
  const existing = await findUserByEmail(email);
  if (!existing) {
    return { invited: false, inviteLink: `/invite?agencyId=${agencyId}&email=${encodeURIComponent(email)}` };
  }

  await upsertMembership(agencyId, existing.id, role);
  return { invited: true, userId: existing.id, email: existing.email };
}

export async function patchAgencyMember(agencyId: string, memberUserId: string, input: Record<string, unknown>, userId: string) {
  await assertManageAccess(agencyId, userId);
  return updateMembership(agencyId, memberUserId, {
    ...(input.role !== undefined ? { role: String(input.role) } : {}),
    ...(input.isActive !== undefined ? { isActive: Boolean(input.isActive) } : {}),
  });
}

export async function removeAgencyMember(agencyId: string, memberUserId: string, userId: string) {
  await assertManageAccess(agencyId, userId);
  await deleteMembership(agencyId, memberUserId);
  return { success: true };
}
