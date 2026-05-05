import type { LeadFormValues } from '@/features/lead-create/model/types';

interface LeadNeedSectionProps {
  form: LeadFormValues;
  onChange: (key: keyof LeadFormValues, value: string) => void;
  t: (key: string) => string;
}

export function LeadNeedSection({ form, onChange, t }: LeadNeedSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.needType')}</label>
        <select
          value={form.needType}
          onChange={(event) => onChange('needType', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
        >
          <option value="buy">{t('leads.dialog.needBuy')}</option>
          <option value="sell">{t('leads.dialog.needSell')}</option>
          <option value="rent">{t('leads.dialog.needRent')}</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.budget')} (USD)</label>
        <input
          type="number"
          value={form.budget}
          onChange={(event) => onChange('budget', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
