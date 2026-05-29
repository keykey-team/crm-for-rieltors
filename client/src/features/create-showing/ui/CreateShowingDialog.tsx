'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { createShowing, getShowingDuplicates } from '@/entities/showing';
import { getProperties } from '@/entities/property';
import { getLeads } from '@/entities/lead';
import { getUsers } from '@/entities/user';
import type { CreateShowingInput, Showing } from '@/entities/showing';

type Props = {
  initialValues?: Partial<CreateShowingInput>;
  onClose: () => void;
  onSaved: (showing: Showing) => void | Promise<void>;
};

export function CreateShowingDialog({ initialValues, onClose, onSaved }: Props) {
  const { t, locale } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<Showing[]>([]);
  const [form, setForm] = useState({
    dealId: initialValues?.dealId ?? '',
    propertyId: initialValues?.propertyId ?? '',
    leadId: initialValues?.leadId ?? '',
    agentId: initialValues?.agentId ?? '',
    scheduledAt: initialValues?.scheduledAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    durationMin: String(initialValues?.durationMin ?? 30),
  });

  useEffect(() => {
    getProperties().then(setProperties).catch(() => {});
    getLeads().then(setLeads).catch(() => {});
    getUsers().then(setAgents).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.propertyId || !form.leadId) {
      setDuplicates([]);
      return;
    }
    getShowingDuplicates(form.propertyId, form.leadId).then(setDuplicates).catch(() => setDuplicates([]));
  }, [form.propertyId, form.leadId]);

  const duplicateText = useMemo(() => {
    if (duplicates.length === 0) return '';
    const lastDate = duplicates[0]?.scheduledAt ? new Date(duplicates[0].scheduledAt).toLocaleString(locale) : '—';
    return t('showings.duplicateWarning').replace('{count}', String(duplicates.length)).replace('{date}', lastDate);
  }, [duplicates, locale, t]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{t('showings.create')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form
          className="p-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!form.propertyId || !form.scheduledAt) {
              toast.error(t('settings.fillFields'));
              return;
            }
            setSaving(true);
            try {
              const created = await createShowing({
                dealId: form.dealId || undefined,
                propertyId: form.propertyId,
                leadId: form.leadId || undefined,
                agentId: form.agentId || undefined,
                scheduledAt: new Date(form.scheduledAt).toISOString(),
                durationMin: Number(form.durationMin) || 30,
                status: 'scheduled',
              });
              await onSaved(created);
            } catch (err: any) {
              toast.error(err?.message || t('common.error'));
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('deals.property')} *</label>
              <select value={form.propertyId} onChange={(e) => setForm((p) => ({ ...p, propertyId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('deals.dialog.selectProperty')}</option>
                {properties.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('deals.contact')}</label>
              <select value={form.leadId} onChange={(e) => setForm((p) => ({ ...p, leadId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('deals.dialog.selectLead')}</option>
                {leads.map((item) => <option key={item.id} value={item.id}>{`${item.firstName || ''} ${item.lastName || ''}`.trim() || item.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('showings.agent')}</label>
              <select value={form.agentId} onChange={(e) => setForm((p) => ({ ...p, agentId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('deals.notAssigned')}</option>
                {agents.map((item) => <option key={item.id} value={item.id}>{item.name || item.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('showings.duration')}</label>
              <input type="number" min={5} step={5} value={form.durationMin} onChange={(e) => setForm((p) => ({ ...p, durationMin: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('showings.scheduledAt')} *</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
          </div>
          {duplicateText ? <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">{duplicateText}</div> : null}
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
