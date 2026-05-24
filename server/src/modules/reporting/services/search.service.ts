import { isAdminRole } from '../../../common/shared-kernel/roles';
import { searchRecords } from '../repositories/search.repository';

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

export async function searchDashboard(query: Record<string, unknown>, userId?: string, role?: string) {
  const q = (typeof query.q === 'string' ? query.q : '').trim();
  if (!q || q.length < 2) return { leads: [], deals: [], properties: [], tasks: [] };
  return searchRecords(q, ownership(role, userId));
}
