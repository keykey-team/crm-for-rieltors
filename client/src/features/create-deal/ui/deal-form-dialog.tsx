'use client';

import { X, Search, User, Building, ChevronDown } from 'lucide-react';

import { useTranslation } from '@/shared/lib/i18n/context';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import { useDealForm } from '@/features/create-deal/model/use-deal-form';

export function DealFormDialog({ deal, onSave, onClose }: { deal: Deal | null; onSave: (d: DealUpsertInput) => void | Promise<void>; onClose: () => void }) {
  const { t } = useTranslation();
  const { stages, users, form, saving, leadOpen, propOpen, leadSearch, propSearch, filteredLeads, filteredProps, selectedLead, selectedProp, setLeadOpen, setPropOpen, setLeadSearch, setPropSearch, upd, submit } = useDealForm(deal, onSave);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-lg">{deal ? t('deals.dialog.editDeal') : t('deals.dialog.newDeal')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Назва угоди</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Лід</label>
            <div className="relative">
            <button type="button" onClick={() => { setLeadOpen(!leadOpen); setPropOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedLead ? <span className="flex items-center gap-2 truncate"><User className="w-3.5 h-3.5 text-muted-foreground" />{selectedLead.firstName} {selectedLead.lastName}</span> : <span className="text-muted-foreground">{t('deals.dialog.selectLead')}</span>}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {leadOpen && <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg"><div className="p-2 border-b border-border"><div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm" /></div></div><div className="overflow-y-auto max-h-44"><button type="button" onClick={() => { upd('leadId', ''); setLeadOpen(false); setLeadSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">— {t('common.notSelected')}</button>{filteredLeads.map((l) => <button type="button" key={l.id} onClick={() => { upd('leadId', l.id); setLeadOpen(false); setLeadSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">{l.firstName} {l.lastName}</button>)}</div></div>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Об'єкт</label>
            <div className="relative">
            <button type="button" onClick={() => { setPropOpen(!propOpen); setLeadOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedProp ? <span className="flex items-center gap-2 truncate"><Building className="w-3.5 h-3.5 text-muted-foreground" />{selectedProp.title}</span> : <span className="text-muted-foreground">{t('deals.dialog.selectProperty')}</span>}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {propOpen && <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg"><div className="p-2 border-b border-border"><div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={propSearch} onChange={(e) => setPropSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm" /></div></div><div className="overflow-y-auto max-h-44"><button type="button" onClick={() => { upd('propertyId', ''); setPropOpen(false); setPropSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">— {t('common.notSelected')}</button>{filteredProps.map((p) => <button type="button" key={p.id} onClick={() => { upd('propertyId', p.id); setPropOpen(false); setPropSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">{p.title}</button>)}</div></div>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Етап угоди</label>
            <select value={form.stage ?? 'new_lead'} onChange={(e) => upd('stage', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">{stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Сума</label>
              <input type="number" value={form.amount} onChange={(e) => upd('amount', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Комісія (%)</label>
              <input type="number" step="0.1" value={form.commission} onChange={(e) => upd('commission', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Валюта</label>
              <select value={form.currency ?? 'USD'} onChange={(e) => upd('currency', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"><option value="USD">USD</option><option value="UAH">UAH</option><option value="EUR">EUR</option></select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Відповідальний</label>
            <select value={form.assignedToId ?? ''} onChange={(e) => upd('assignedToId', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"><option value="">{t('leads.autoAssign')}</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Нотатки</label>
            <textarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button><button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button></div>
        </form>
      </div>
    </div>
  );
}
