import type { LeadFormValues } from '@/features/lead-create/model/types';

interface LeadNotesSectionProps {
  form: LeadFormValues;
  onChange: (key: keyof LeadFormValues, value: string) => void;
  t: (key: string) => string;
}

export function LeadNotesSection({ form, onChange, t }: LeadNotesSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{t('common.notes')}</label>
      <textarea
        rows={3}
        value={form.notes}
        onChange={(event) => onChange('notes', event.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
    </div>
  );
}
