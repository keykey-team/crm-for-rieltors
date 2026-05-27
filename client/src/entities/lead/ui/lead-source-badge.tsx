import { LEAD_SOURCES } from '@/shared/lib/constants';

export function LeadSourceBadge({ source, t }: { source?: string | null; t: (k: string) => string }) {
  const found = LEAD_SOURCES.find((s) => s.value === source);
  return (
    <span className="text-xs bg-muted px-2 py-0.5 rounded-md">
      {t(`const.leadSource.${source}`) || found?.label || source || '-'}
    </span>
  );
}
