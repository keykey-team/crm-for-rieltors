'use client';
import { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, ArrowRight, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import type { Automation, AutomationUpsertInput } from '@/entities/automation';
import { useAutomationsPage } from '@/widgets/automations/model/use-automations-page';

export function AutomationsClient() {
  const { t } = useTranslation();
  const {
    automations,
    loading,
    showDialog,
    setShowDialog,
    editing,
    setEditing,
    triggers,
    actions,
    handleSave,
    toggleActive,
    handleDelete,
  } = useAutomationsPage(t);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight"><HintTooltip text={t('hints.automations')} position="bottom">{t('automations.title')}</HintTooltip></h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('automations.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowDialog(true); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition active:scale-95">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('automations.newRule')}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('automations.noAutomations')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map(a => (
            <div key={a.id} className={cn('bg-card rounded-xl p-4 border border-border transition', !a.isActive && 'opacity-60')}
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{a.name}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {a.isActive ? t('automations.active') : t('automations.disabled')}
                    </span>
                  </div>
                  {a.description && <p className="text-xs text-muted-foreground mb-2">{a.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                      {triggers.find((tr) => tr.value === a.trigger)?.label ?? a.trigger}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-[#073B34]/10 text-[#073B34] dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                      {actions.find((ac) => ac.value === a.action)?.label ?? a.action}
                    </span>
                  </div>
                  {a.lastRunAt && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {t('automations.lastRun')}: {new Date(a.lastRunAt).toLocaleString('uk-UA')} — {a.lastRunResult ?? '—'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(a)} className="p-2 hover:bg-muted rounded-lg transition">
                    {a.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => { setEditing(a); setShowDialog(true); }} className="p-2 hover:bg-muted rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <AutomationDialog automation={editing} onSave={handleSave} onClose={() => { setShowDialog(false); setEditing(null); }} t={t} triggers={triggers} actions={actions} />
      )}
    </div>
  );
}

function AutomationDialog({ automation, onSave, onClose, t, triggers, actions }: { automation: Automation | null; onSave: (d: AutomationUpsertInput) => void | Promise<void>; onClose: () => void; t: (k: string) => string; triggers: { value: string; label: string }[]; actions: { value: string; label: string }[] }) {
  const [name, setName] = useState(automation?.name ?? '');
  const [description, setDescription] = useState(automation?.description ?? '');
  const [trigger, setTrigger] = useState(automation?.trigger ?? 'stage_change');
  const [triggerValue, setTriggerValue] = useState(automation?.triggerValue ?? '');
  const [action, setAction] = useState(automation?.action ?? 'create_task');
  const [actionValue, setActionValue] = useState(automation?.actionValue ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await onSave({ name, description, trigger, triggerValue, action, actionValue });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display font-bold">{automation ? t('automations.editAutomation') : t('automations.newAutomation')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.description')}</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('automations.trigger')}</label>
              <select value={trigger} onChange={e => setTrigger(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {triggers.map(tr => <option key={tr.value} value={tr.value}>{tr.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('automations.triggerValue')}</label>
              <input value={triggerValue} onChange={e => setTriggerValue(e.target.value)} placeholder={t('common.optional')}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('automations.action')}</label>
              <select value={action} onChange={e => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {actions.map(ac => <option key={ac.value} value={ac.value}>{ac.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('automations.actionValue')}</label>
              <input value={actionValue} onChange={e => setActionValue(e.target.value)} placeholder={t('common.optional')}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button type="submit" disabled={saving || !name}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
