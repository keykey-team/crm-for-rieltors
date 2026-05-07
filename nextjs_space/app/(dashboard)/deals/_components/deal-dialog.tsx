'use client';
import { useTranslation } from '@/lib/i18n/context';
import { useState, useEffect, useMemo } from 'react';
import { X, Search, User, Building, ChevronDown } from 'lucide-react';
import { DEAL_STAGES } from '@/lib/constants';

export function DealDialog({ deal, onSave, onClose }: { deal: any; onSave: (d: any) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [stages, setStages] = useState(DEAL_STAGES);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/funnel-stages').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setStages(d); }).catch(() => {});
    fetch('/api/leads').then(r => r.json()).then(d => { if (Array.isArray(d)) setLeads(d); }).catch(() => {});
    fetch('/api/properties').then(r => r.json()).then(d => { if (Array.isArray(d)) setProperties(d); }).catch(() => {});
    fetch('/api/users').then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    title: deal?.title ?? '',
    stage: deal?.stage ?? 'new_lead',
    amount: deal?.amount?.toString() ?? '',
    commission: deal?.commission?.toString() ?? '',
    currency: deal?.currency ?? 'USD',
    notes: deal?.notes ?? '',
    leadId: deal?.leadId ?? '',
    propertyId: deal?.propertyId ?? '',
    assignedToId: deal?.assignedToId ?? '',
  });

  const [leadSearch, setLeadSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const [leadOpen, setLeadOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filteredLeads = useMemo(() => {
    if (!leadSearch.trim()) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter((l: any) =>
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
      (l.phone ?? '').includes(q) ||
      (l.email ?? '').toLowerCase().includes(q)
    );
  }, [leads, leadSearch]);

  const filteredProps = useMemo(() => {
    if (!propSearch.trim()) return properties;
    const q = propSearch.toLowerCase();
    return properties.filter((p: any) =>
      (p.title ?? '').toLowerCase().includes(q) ||
      (p.address ?? '').toLowerCase().includes(q)
    );
  }, [properties, propSearch]);

  const selectedLead = leads.find((l: any) => l.id === form.leadId);
  const selectedProp = properties.find((p: any) => p.id === form.propertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      leadId: form.leadId || null,
      propertyId: form.propertyId || null,
      assignedToId: form.assignedToId || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-lg">{deal ? t('deals.dialog.editDeal') : t('deals.dialog.newDeal')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {/* Lead selector */}
          <div className="relative">
            <label className="text-sm font-medium mb-1 block">{t('common.lead')}</label>
            <button type="button" onClick={() => { setLeadOpen(!leadOpen); setPropOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedLead ? (
                <span className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  {selectedLead.firstName} {selectedLead.lastName} <span className="text-muted-foreground">({selectedLead.phone})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">{t('deals.dialog.selectLead')}</span>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
            {leadOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} autoFocus
                      placeholder={t('common.search') + '...'}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-44">
                  <button type="button" onClick={() => { upd('leadId', ''); setLeadOpen(false); setLeadSearch(''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 text-muted-foreground">
                    — {t('common.notSelected')}
                  </button>
                  {filteredLeads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>
                  )}
                  {filteredLeads.map((l: any) => (
                    <button type="button" key={l.id} onClick={() => { upd('leadId', l.id); setLeadOpen(false); setLeadSearch(''); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 ${form.leadId === l.id ? 'bg-primary/10 font-medium' : ''}`}>
                      <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{l.firstName} {l.lastName}</span>
                      <span className="text-muted-foreground text-xs ml-auto flex-shrink-0">{l.phone}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Property selector */}
          <div className="relative">
            <label className="text-sm font-medium mb-1 block">{t('common.property')}</label>
            <button type="button" onClick={() => { setPropOpen(!propOpen); setLeadOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedProp ? (
                <span className="flex items-center gap-2 truncate">
                  <Building className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  {selectedProp.title} <span className="text-muted-foreground">({selectedProp.address})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">{t('deals.dialog.selectProperty')}</span>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
            {propOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={propSearch} onChange={(e) => setPropSearch(e.target.value)} autoFocus
                      placeholder={t('common.search') + '...'}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-44">
                  <button type="button" onClick={() => { upd('propertyId', ''); setPropOpen(false); setPropSearch(''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 text-muted-foreground">
                    — {t('common.notSelected')}
                  </button>
                  {filteredProps.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>
                  )}
                  {filteredProps.map((p: any) => (
                    <button type="button" key={p.id} onClick={() => { upd('propertyId', p.id); setPropOpen(false); setPropSearch(''); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 ${form.propertyId === p.id ? 'bg-primary/10 font-medium' : ''}`}>
                      <Building className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{p.title}</span>
                      <span className="text-muted-foreground text-xs ml-auto flex-shrink-0">{p.address?.slice(0, 20)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stage */}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.stage')}</label>
            <select value={form.stage} onChange={(e) => upd('stage', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              {stages.map((s: any) => { const _t = t(`const.dealStage.${s.value}`); return <option key={s.value} value={s.value}>{_t && !_t.startsWith('const.') ? _t : s.label}</option>; })}
            </select>
          </div>

          {/* Amount + Commission + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.amount')}</label>
              <div className="flex gap-2">
                <input type="number" value={form.amount} onChange={(e) => upd('amount', e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <select value={form.currency} onChange={(e) => upd('currency', e.target.value)}
                  className="w-20 px-2 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                  <option value="USD">USD</option>
                  <option value="UAH">UAH</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.commission')} (%)</label>
              <input type="number" step="0.1" value={form.commission} onChange={(e) => upd('commission', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* Manager */}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.manager')}</label>
            <select value={form.assignedToId} onChange={(e) => upd('assignedToId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              <option value="">{t('leads.autoAssign')}</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({t(`role.${u.role}`)})</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.notes')}</label>
            <textarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          {/* Actions */}
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
