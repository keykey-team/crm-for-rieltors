import { PROPERTY_STATUSES } from '@/shared/lib/constants';

export function PropertyStatusBadge({ status, t }: { status?: string | null; t: (k: string) => string }) {
  const found = PROPERTY_STATUSES.find((s) => s.value === status);
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: (found?.color ?? '#999') + '15', color: found?.color ?? '#999' }}>
      {t(`const.propertyStatus.${status}`) || found?.label || status || '-'}
    </span>
  );
}
