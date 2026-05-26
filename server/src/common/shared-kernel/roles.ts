export const ADMIN_ROLES = ['admin', 'director'] as const;

export function isAdminRole(role?: string): boolean {
  return Boolean(role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

