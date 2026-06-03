'use client';

export interface SelectionDetailsDraft {
  title: string;
  message: string;
  expiresAt: string;
}

interface Props {
  draft: SelectionDetailsDraft;
  setDraft: (value: SelectionDetailsDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export function SelectionDetailsForm({ draft, setDraft, onSave, onCancel, t }: Props) {
  return (
    <div className="grid gap-2 rounded-xl border border-border/60 p-3">
      <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t('selections.title')} className="px-3 py-2 border border-border rounded-lg bg-card text-sm" />
      <textarea value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} placeholder={t('selections.message')} className="px-3 py-2 border border-border rounded-lg bg-card text-sm" rows={2} />
      <input type="datetime-local" value={draft.expiresAt} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} className="px-3 py-2 border border-border rounded-lg bg-card text-sm" />
      <div className="flex gap-2">
        <button onClick={onSave} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm">{t('common.save')}</button>
        <button onClick={onCancel} className="px-3 py-1.5 border rounded-lg text-sm">{t('common.cancel')}</button>
      </div>
    </div>
  );
}
