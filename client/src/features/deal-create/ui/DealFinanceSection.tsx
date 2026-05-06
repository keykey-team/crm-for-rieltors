import type { DealFormValues } from '@/features/deal-create/model/types';

interface DealFinanceSectionProps {
  form: DealFormValues;
  onChange: (key: keyof DealFormValues, value: string) => void;
  t: (key: string) => string;
}

export function DealFinanceSection({ form, onChange, t }: DealFinanceSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.amount')} (USD)</label>
        <input
          type="number"
          value={form.amount}
          onChange={(event) => onChange('amount', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('common.commission')} (%)</label>
        <input
          type="number"
          step="0.1"
          value={form.commission}
          onChange={(event) => onChange('commission', event.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
