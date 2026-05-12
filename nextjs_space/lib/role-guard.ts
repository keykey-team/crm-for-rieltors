import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export type Role = 'admin' | 'director' | 'agent';

const ROLE_HIERARCHY: Record<Role, number> = { admin: 3, director: 2, agent: 1 };

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

/**
 * Get current authenticated user with role.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: (session.user as any).id,
    email: session.user.email!,
    name: session.user.name ?? null,
    role: ((session.user as any).role as Role) ?? 'agent',
  };
}

/**
 * Check if user has required role or higher.
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Checks session + role. Returns error response or user.
 */
export async function requireRole(requiredRole: Role): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasRole(user.role, requiredRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

/**
 * Build where clause that filters by assignedToId for agents.
 * Directors and admins see everything.
 */
export function ownershipFilter(user: SessionUser, fieldName = 'assignedToId'): Record<string, any> {
  if (hasRole(user.role, 'director')) return {};
  return { [fieldName]: user.id };
}
