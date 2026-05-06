import { prisma } from '@/shared/lib/db';

export type EntityType = 'lead' | 'deal' | 'task' | 'property' | 'event' | 'automation' | 'user' | 'template';
export type ActionType = 'create' | 'update' | 'delete' | 'stage_change' | 'status_change' | 'assign';

interface LogParams {
  entityType: EntityType;
  entityId: string;
  action: ActionType;
  details?: string;
  userId?: string | null;
}

export async function logActivity(params: LogParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        details: params.details ?? null,
        userId: params.userId ?? null,
      },
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to log activity:', err);
  }
}

export function buildDetails(changes: Record<string, { from?: any; to?: any }>): string {
  const parts = Object.entries(changes)
    .filter(([, v]) => v.from !== v.to)
    .map(([k, v]) => `${k}: ${v.from ?? '—'} → ${v.to ?? '—'}`);
  return parts.join('; ');
}
