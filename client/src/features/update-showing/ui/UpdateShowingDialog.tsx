'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { updateShowing } from '@/entities/showing';
import type { Showing } from '@/entities/showing';

type Props = {
  showing: Showing;
  onClose: () => void;
  onSaved: (showing: Showing) => void | Promise<void>;
};

export function UpdateShowingDialog({ showing, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(showing.status);
  const [feedback, setFeedback] = useState(showing.feedback || '');
  const [clientRating, setClientRating] = useState(showing.clientRating ? String(showing.clientRating) : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{t('showings.update')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form className="p-6 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            const updated = await updateShowing(showing.id, {
              status,
              feedback: feedback || undefined,
              clientRating: clientRating ? Number(clientRating) : undefined,
            });
            await onSaved(updated);
          } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            toast.error(
              msg.toLowerCase().includes('clientrating') || msg.toLowerCase().includes('completed showing')
                ? t('showings.ratingOnlyForCompleted')
                : msg || t('common.error'),
            );
          } finally {
            setSaving(false);
          }
        }}>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('showings.status')}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              {['scheduled', 'completed', 'cancelled', 'no_show'].map((item) => (
                <option key={item} value={item}>{t(`showings.status.${item}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('showings.feedback')}</label>
            <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('showings.rating')}</label>
            <input type="number" min={1} max={5} value={clientRating} onChange={(e) => setClientRating(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
