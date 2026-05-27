export interface ActivityLogItem {
  id: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  details?: string;
  createdAt?: string;
  user?: { id: string; name?: string | null } | null;
}
