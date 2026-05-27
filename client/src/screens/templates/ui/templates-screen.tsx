'use client';
import { useCallback, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Copy, X } from 'lucide-react';
import { useFormDraft } from '@/shared/hooks/use-form-draft';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import type { Template, TemplateUpsertInput } from '@/entities/template';
import { useTemplatesPage } from '@/widgets/templates/model/use-templates-page';

export function TemplatesClient() {
  const { t } = useTranslation();
  const {
    templates,
    loading,
    typeFilter,
    setTypeFilter,
    showDialog,
    setShowDialog,
    editing,
    setEditing,
    templateTypes,
    templateCategories,
    handleSave,
    handleDelete,
    copyContent,
  } = useTemplatesPage(t);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">{t('templates.title')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('templates.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowDialog(true); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition active:scale-95">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('templates.add')}</span>
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTypeFilter('')}
          className={cn('px-3 py-1.5 rounded-lg text-sm transition', !typeFilter ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>{t('common.all')}</button>
        {templateTypes.map((tp) => (
          <button key={tp.value} onClick={() => setTypeFilter(tp.value)}
            className={cn('px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5',
              typeFilter === tp.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
            <tp.icon className="w-3.5 h-3.5" /> {tp.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('templates.noTemplates')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(tp => {
            const typeInfo = templateTypes.find((tt) => tt.value === tp.type);
            const catInfo = templateCategories.find((c) => c.value === tp.category);
            return (
              <div key={tp.id} className="bg-card rounded-xl p-4 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{tp.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{typeInfo?.label ?? tp.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{catInfo?.label ?? tp.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => copyContent(tp.content)} className="p-1.5 hover:bg-muted rounded-lg transition">
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => { setEditing(tp); setShowDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg transition">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(tp.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{tp.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {showDialog && (
        <TemplateDialog template={editing} onSave={handleSave} onClose={() => { setShowDialog(false); setEditing(null); }} t={t} templateTypes={templateTypes} templateCategories={templateCategories} />
      )}
    </div>
  );
}

function TemplateDialog({ template, onSave, onClose, t, templateTypes, templateCategories }: { template: Template | null; onSave: (d: TemplateUpsertInput) => void | Promise<void>; onClose: () => void; t: (k: string) => string; templateTypes: { value: string; label: string; icon: any }[]; templateCategories: { value: string; label: string }[] }) {
  const createInitialValue = useCallback(() => ({
    name: template?.name ?? '',
    type: template?.type ?? 'message',
    category: template?.category ?? 'general',
    content: template?.content ?? '',
  }), [template]);
  const { form, setForm, clearDraft, resetForm } = useFormDraft({
    storageKey: 'crm_create_template_draft',
    createInitialValue,
    draftEnabled: !template,
    resetKey: template?.id ?? 'create',
  });
  const [saving, setSaving] = useState(false);

  const handleDismiss = () => {
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await onSave({ name: form.name, type: form.type, category: form.category, content: form.content });
    if (!template) clearDraft();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={handleDismiss}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display font-bold">{template ? t('templates.editTemplate') : t('templates.newTemplate')}</h2>
          <button onClick={handleDismiss} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.name} onChange={e => setForm((prev) => ({ ...prev, name: e.target.value }))} required
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.type')}</label>
              <select value={form.type} onChange={e => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {templateTypes.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('kb.category')}</label>
              <select value={form.category} onChange={e => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {templateCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.content')} *</label>
            <textarea value={form.content} onChange={e => setForm((prev) => ({ ...prev, content: e.target.value }))} required rows={6}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button type="submit" disabled={saving || !form.name || !form.content}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
