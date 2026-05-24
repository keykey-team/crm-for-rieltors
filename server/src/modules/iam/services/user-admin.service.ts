import bcrypt from 'bcryptjs';
import { forbidden } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { createManagedUser, deleteManagedUser, findManagedUsers, updateManagedUser } from '../repositories/user-admin.repository';

function assertCanManageUsers(role?: string): void {
  if (!isAdminRole(role)) throw forbidden();
}

export async function listUsers() {
  return findManagedUsers();
}

export async function addUser(input: Record<string, unknown>, role?: string) {
  assertCanManageUsers(role);
  return createManagedUser({
    name: input.name,
    email: input.email,
    password: await bcrypt.hash(String(input.password ?? ''), 12),
    role: input.role ?? 'agent',
    phone: input.phone ?? null,
    permissions: input.permissions ?? null,
  });
}

export async function changeUser(id: string, input: Record<string, unknown>, role?: string) {
  assertCanManageUsers(role);
  return updateManagedUser(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.permissions !== undefined ? { permissions: input.permissions } : {}),
  });
}

export async function removeUser(id: string, role?: string) {
  assertCanManageUsers(role);
  await deleteManagedUser(id);
  return { success: true };
}
