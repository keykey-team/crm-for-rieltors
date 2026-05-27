'use client';

import { X, Search, User, Building, ChevronDown, Plus } from 'lucide-react';

import { useTranslation } from '@/shared/lib/i18n/context';
import { PhoneInput } from '@/shared/ui/phone-input';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import { useDealForm } from '@/features/create-deal/model/use-deal-form';

export function DealFormDialog({ deal, onSave, onClose }: { deal: Deal | null; onSave: (d: DealUpsertInput) => void | Promise<void>; onClose: () => void }) {
  const { t } = useTranslation();
  const {
    stages,
    users,
    form,
    saving,
    errors,
    submitError,
    leadOpen,
    propOpen,
    showNewLeadForm,
    showNewPropForm,
    newLeadForm,
    newPropForm,
    creatingLead,
    creatingProp,
    leadCreateError,
    propCreateError,
    newLeadErrors,
    newPropErrors,
    leadSearch,
    propSearch,
    filteredLeads,
    filteredProps,
    selectedLead,
    selectedProp,
    setLeadOpen,
    setPropOpen,
    setShowNewLeadForm,
    setShowNewPropForm,
    setNewLeadForm,
    setNewPropForm,
    setLeadCreateError,
    setPropCreateError,
    setLeadSearch,
    setPropSearch,
    updateNewLeadField,
    updateNewPropField,
    resetNewLeadFormState,
    resetNewPropFormState,
    createLeadOption,
    createPropertyOption,
    upd,
    submit,
  } = useDealForm(deal, onSave, t);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-lg">{deal ? t('deals.dialog.editDeal') : t('deals.dialog.newDeal')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {submitError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('common.title')}</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.title ? 'border-destructive/60' : 'border-border'}`} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.dialog.selectLead')}</label>
            <div className="relative">
            <button type="button" onClick={() => { setLeadOpen(!leadOpen); setPropOpen(false); setShowNewPropForm(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedLead ? <span className="flex items-center gap-2 truncate"><User className="w-3.5 h-3.5 text-muted-foreground" />{selectedLead.firstName} {selectedLead.lastName}</span> : <span className="text-muted-foreground">{t('deals.dialog.selectLead')}</span>}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {leadOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                {!showNewLeadForm ? (
                  <>
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm" />
                      </div>
                    </div>
                    <button type="button" onClick={() => { setShowNewLeadForm(true); setLeadCreateError(''); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 border-b border-border font-medium">
                      <Plus className="w-4 h-4" /> {t('leads.dialog.newLead')}
                    </button>
                    <div className="overflow-y-auto max-h-44">
                      <button type="button" onClick={() => { upd('leadId', ''); setLeadOpen(false); setLeadSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">— {t('common.notSelected')}</button>
                      {filteredLeads.map((l) => <button type="button" key={l.id} onClick={() => { upd('leadId', l.id); setLeadOpen(false); setLeadSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">{l.firstName} {l.lastName}</button>)}
                    </div>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{t('leads.dialog.newLead')}</p>
                      <button type="button" onClick={resetNewLeadFormState} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    {leadCreateError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">{leadCreateError}</p> : null}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input autoFocus value={newLeadForm.firstName} onChange={(e) => updateNewLeadField('firstName', e.target.value)} placeholder={`${t('common.name')} *`} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newLeadErrors.firstName ? 'border-destructive/60' : 'border-border'}`} />
                        {newLeadErrors.firstName ? <p className="mt-1 text-xs text-destructive">{newLeadErrors.firstName}</p> : null}
                      </div>
                      <div>
                        <input value={newLeadForm.lastName} onChange={(e) => updateNewLeadField('lastName', e.target.value)} placeholder={t('common.lastName')} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newLeadErrors.lastName ? 'border-destructive/60' : 'border-border'}`} />
                        {newLeadErrors.lastName ? <p className="mt-1 text-xs text-destructive">{newLeadErrors.lastName}</p> : null}
                      </div>
                    </div>
                    <div>
                      <PhoneInput value={newLeadForm.phone} onChange={(v) => updateNewLeadField('phone', v)} error={!!newLeadErrors.phone} />
                      {newLeadErrors.phone ? <p className="mt-1 text-xs text-destructive">{newLeadErrors.phone}</p> : null}
                    </div>
                    <div>
                      <input value={newLeadForm.email} onChange={(e) => updateNewLeadField('email', e.target.value)} placeholder={t('common.email')} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newLeadErrors.email ? 'border-destructive/60' : 'border-border'}`} />
                      {newLeadErrors.email ? <p className="mt-1 text-xs text-destructive">{newLeadErrors.email}</p> : null}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={resetNewLeadFormState} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/60">{t('common.cancel')}</button>
                      <button type="button" onClick={createLeadOption} disabled={creatingLead || !newLeadForm.firstName.trim() || !newLeadForm.phone.trim()} className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">{creatingLead ? t('common.saving') : t('common.create')}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.dialog.selectProperty')}</label>
            <div className="relative">
            <button type="button" onClick={() => { setPropOpen(!propOpen); setLeadOpen(false); setShowNewLeadForm(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-left">
              {selectedProp ? <span className="flex items-center gap-2 truncate"><Building className="w-3.5 h-3.5 text-muted-foreground" />{selectedProp.title}</span> : <span className="text-muted-foreground">{t('deals.dialog.selectProperty')}</span>}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {propOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                {!showNewPropForm ? (
                  <>
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={propSearch} onChange={(e) => setPropSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm" />
                      </div>
                    </div>
                    <button type="button" onClick={() => { setShowNewPropForm(true); setPropCreateError(''); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 border-b border-border font-medium">
                      <Plus className="w-4 h-4" /> {t('properties.dialog.newProperty')}
                    </button>
                    <div className="overflow-y-auto max-h-44">
                      <button type="button" onClick={() => { upd('propertyId', ''); setPropOpen(false); setPropSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">— {t('common.notSelected')}</button>
                      {filteredProps.map((p) => <button type="button" key={p.id} onClick={() => { upd('propertyId', p.id); setPropOpen(false); setPropSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50">{p.title}</button>)}
                    </div>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{t('properties.dialog.newProperty')}</p>
                      <button type="button" onClick={resetNewPropFormState} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    {propCreateError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">{propCreateError}</p> : null}
                    <div>
                      <input autoFocus value={newPropForm.title} onChange={(e) => updateNewPropField('title', e.target.value)} placeholder={`${t('common.title')} *`} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newPropErrors.title ? 'border-destructive/60' : 'border-border'}`} />
                      {newPropErrors.title ? <p className="mt-1 text-xs text-destructive">{newPropErrors.title}</p> : null}
                    </div>
                    <div>
                      <input value={newPropForm.address} onChange={(e) => updateNewPropField('address', e.target.value)} placeholder={`${t('common.address')} *`} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newPropErrors.address ? 'border-destructive/60' : 'border-border'}`} />
                      {newPropErrors.address ? <p className="mt-1 text-xs text-destructive">{newPropErrors.address}</p> : null}
                    </div>
                    <div>
                      <input type="number" min="0" step="0.01" value={newPropForm.price} onChange={(e) => updateNewPropField('price', e.target.value)} placeholder={`${t('common.price')} *`} className={`w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${newPropErrors.price ? 'border-destructive/60' : 'border-border'}`} />
                      {newPropErrors.price ? <p className="mt-1 text-xs text-destructive">{newPropErrors.price}</p> : null}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={resetNewPropFormState} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/60">{t('common.cancel')}</button>
                      <button type="button" onClick={createPropertyOption} disabled={creatingProp || !newPropForm.title.trim() || !newPropForm.address.trim() || !newPropForm.price.trim()} className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">{creatingProp ? t('common.saving') : t('common.create')}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.stage')}</label>
            <select value={form.stage ?? 'new_lead'} onChange={(e) => upd('stage', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">{stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.amount')}</label>
              <input type="number" value={form.amount} onChange={(e) => upd('amount', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.amount ? 'border-destructive/60' : 'border-border'}`} />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.commission')} (%)</label>
              <input type="number" step="0.1" value={form.commission} onChange={(e) => upd('commission', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.commission ? 'border-destructive/60' : 'border-border'}`} />
              {errors.commission && <p className="text-xs text-destructive mt-1">{errors.commission}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t('deals.currency')}</label>
              <select value={form.currency ?? 'USD'} onChange={(e) => upd('currency', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"><option value="USD">USD</option><option value="UAH">UAH</option><option value="EUR">EUR</option></select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('common.manager')}</label>
            <select value={form.assignedToId ?? ''} onChange={(e) => upd('assignedToId', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"><option value="">{t('leads.autoAssign')}</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t('common.notes')}</label>
            <textarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm resize-none ${errors.notes ? 'border-destructive/60' : 'border-border'}`} />
            {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button><button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button></div>
        </form>
      </div>
    </div>
  );
}
