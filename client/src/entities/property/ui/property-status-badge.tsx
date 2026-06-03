import { PROPERTY_STATUSES } from '@/shared/lib/constants';
import type { PropertyOption } from '../model/usePropertyOptions';

export function PropertyStatusBadge({ status, t, options }: { status?: string | null; t: (k: string) => string; options?: PropertyOption[] }) {
  const found = (options ?? PROPERTY_STATUSES).find((s) => s.value === status);
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: (found?.color ?? '#999') + '15', color: found?.color ?? '#999' }}>
      {t(`const.propertyStatus.${status}`) || found?.label || status || '-'}
    </span>
  );
}
