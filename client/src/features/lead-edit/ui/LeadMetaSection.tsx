import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from '@/shared/lib/constants';
import type { LeadFormValues } from '@/features/lead-edit/model/types';

interface LeadMetaSectionProps {
  form: LeadFormValues;
  onChange: (key: keyof LeadFormValues, value: string) => void;
  t: (key: string) => string;
}

export function LeadMetaSection({ form, onChange, t }: LeadMetaSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.source')}</label>
        <select
          value={form.source}
          onChange={(event) => onChange('source', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
        >
          {LEAD_SOURCES.map((source: any) => (
            <option key={source.value} value={source.value}>
              {t(`const.leadSource.${source.value}`) || source.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.status')}</label>
        <select
          value={form.status}
          onChange={(event) => onChange('status', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
        >
          {LEAD_STATUSES.map((status: any) => (
            <option key={status.value} value={status.value}>
              {t(`const.leadStatus.${status.value}`) || status.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.priority')}</label>
        <select
          value={form.priority}
          onChange={(event) => onChange('priority', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
        >
          {PRIORITIES.map((priority: any) => (
            <option key={priority.value} value={priority.value}>
              {t(`const.priority.${priority.value}`) || priority.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
