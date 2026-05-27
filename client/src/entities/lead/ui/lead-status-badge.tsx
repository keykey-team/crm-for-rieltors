import { LEAD_STATUSES } from '@/shared/lib/constants';

export function LeadStatusBadge({ status, t }: { status?: string | null; t: (k: string) => string }) {
  const found = LEAD_STATUSES.find((s) => s.value === status);
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (found?.color ?? '#999') + '20', color: found?.color ?? '#999' }}>
      {t(`const.leadStatus.${status}`) || found?.label || status || '-'}
    </span>
  );
}
