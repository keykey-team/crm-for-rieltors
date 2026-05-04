'use client';
import { useTranslation } from '@/lib/i18n/context';
import { useState } from 'react';
import { X } from 'lucide-react';
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from '@/lib/constants';

interface Props {
  lead: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function LeadDialog({ lead, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: lead?.firstName ?? '',
    lastName: lead?.lastName ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    source: lead?.source ?? 'manual',
    status: lead?.status ?? 'new',
    needType: lead?.needType ?? 'buy',
    budget: lead?.budget?.toString() ?? '',
    priority: lead?.priority ?? 'medium',
    notes: lead?.notes ?? '',
    districts: lead?.districts ?? '',
    propertyType: lead?.propertyType ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const upd = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{lead ? t('leads.dialog.editLead') : t('leads.dialog.newLead')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.name')} *</label>
              <input value={form.firstName} onChange={(e) => upd('firstName', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.lastName')}</label>
              <input value={form.lastName} onChange={(e) => upd('lastName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.phone')} *</label>
              <input value={form.phone} onChange={(e) => upd('phone', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.email')}</label>
              <input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.source')}</label>
              <select value={form.source} onChange={(e) => upd('source', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {LEAD_SOURCES.map((s: any) => <option key={s.value} value={s.value}>{t(`const.leadSource.${s.value}`) || s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.status')}</label>
              <select value={form.status} onChange={(e) => upd('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {LEAD_STATUSES.map((s: any) => <option key={s.value} value={s.value}>{t(`const.leadStatus.${s.value}`) || s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.priority')}</label>
              <select value={form.priority} onChange={(e) => upd('priority', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {PRIORITIES.map((p: any) => <option key={p.value} value={p.value}>{t(`const.priority.${p.value}`) || p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.needType')}</label>
              <select value={form.needType} onChange={(e) => upd('needType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="buy">{t('leads.dialog.needBuy')}</option>
                <option value="sell">{t('leads.dialog.needSell')}</option>
                <option value="rent">{t('leads.dialog.needRent')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.budget')} (USD)</label>
              <input type="number" value={form.budget} onChange={(e) => upd('budget', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.notes')}</label>
            <textarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">{t('common.cancel')}</button>
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
