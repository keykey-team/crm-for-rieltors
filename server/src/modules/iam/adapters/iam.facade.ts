import { isAdminRole } from '../../../common/shared-kernel/roles';
import { findPublicUserById } from '../repositories/user.repository';

export const iamFacade = {
  getPublicUser: findPublicUserById,
  canViewWorkspaceData(role?: string): boolean {
    return isAdminRole(role);
  },
};

