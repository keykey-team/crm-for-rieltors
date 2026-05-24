import { findActivityLogs } from '../repositories/activity-log.repository';

export async function listActivityLogs(filters: { entityType?: string; entityId?: string }) {
  return findActivityLogs(filters);
}

