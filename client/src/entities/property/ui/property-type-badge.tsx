import { PROPERTY_TYPES } from '@/shared/lib/constants';
import type { PropertyOption } from '../model/usePropertyOptions';

export function PropertyTypeBadge({ type, t, options }: { type?: string | null; t: (k: string) => string; options?: PropertyOption[] }) {
  const found = (options ?? PROPERTY_TYPES).find((pt) => pt.value === type);
  return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/40 text-white backdrop-blur-sm">
      {t(`const.propertyType.${type}`) || found?.label || type || '-'}
    </span>
  );
}
