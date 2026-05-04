'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useState } from 'react';
import { X } from 'lucide-react';
import { DEAL_STAGES } from '@/shared/lib/constants';

export function DealDialog({ deal, onSave, onClose }: { deal: any; onSave: (d: any) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: deal?.title ?? '', stage: deal?.stage ?? 'new_lead',
    amount: deal?.amount?.toString() ?? '', commission: deal?.commission?.toString() ?? '',
    notes: deal?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); await onSave(form); setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{deal ? t('deals.dialog.editDeal') : t('deals.dialog.newDeal')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.stage')}</label>
            <select value={form.stage} onChange={(e) => upd('stage', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              {DEAL_STAGES.map((s: any) => <option key={s.value} value={s.value}>{t(`const.dealStage.${s.value}`) || s.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.amount')} (USD)</label>
              <input type="number" value={form.amount} onChange={(e) => upd('amount', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.commission')} (%)</label>
              <input type="number" step="0.1" value={form.commission} onChange={(e) => upd('commission', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.notes')}</label>
            <textarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
