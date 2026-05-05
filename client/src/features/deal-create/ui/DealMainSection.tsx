import { DEAL_STAGES } from '@/shared/lib/constants';
import type { DealFormValues } from '@/features/deal-create/model/types';

interface DealMainSectionProps {
  form: DealFormValues;
  onChange: (key: keyof DealFormValues, value: string) => void;
  t: (key: string) => string;
}

export function DealMainSection({ form, onChange, t }: DealMainSectionProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
        <input
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.stage')}</label>
        <select
          value={form.stage}
          onChange={(event) => onChange('stage', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
        >
          {DEAL_STAGES.map((stage: any) => (
            <option key={stage.value} value={stage.value}>
              {t(`const.dealStage.${stage.value}`) || stage.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
