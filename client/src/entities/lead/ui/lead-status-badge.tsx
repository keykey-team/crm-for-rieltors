import { LEAD_STATUSES } from '@/shared/lib/constants';
import { normalizeStageValue, resolveDealStageLabel } from '@/shared/lib/funnel-stages';

export function LeadStatusBadge({ status, t }: { status?: string | null; t: (k: string) => string }) {
  const found = LEAD_STATUSES.find((s) => s.value === normalizeStageValue(status));
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (found?.color ?? '#999') + '20', color: found?.color ?? '#999' }}>
      {resolveDealStageLabel({ value: status, label: found?.label }, t)}
    </span>
  );
}
