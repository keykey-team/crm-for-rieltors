import type { LeadFormValues } from '@/features/lead-edit/model/types';
interface LeadContactSectionProps {
  form: LeadFormValues;
  onChange: (key: keyof LeadFormValues, value: string) => void;
  t: (key: string) => string;
}

export function LeadContactSection({ form, onChange, t }: LeadContactSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('common.name')} *</label>
          <input
            value={form.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('common.lastName')}</label>
          <input
            value={form.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('common.phone')} *</label>
          <input
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('common.email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </>
  );
}
