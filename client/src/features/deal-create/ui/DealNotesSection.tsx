import type { DealFormValues } from '@/features/deal-create/model/types';

interface DealNotesSectionProps {
  form: DealFormValues;
  onChange: (key: keyof DealFormValues, value: string) => void;
  t: (key: string) => string;
}

export function DealNotesSection({ form, onChange, t }: DealNotesSectionProps) {
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
