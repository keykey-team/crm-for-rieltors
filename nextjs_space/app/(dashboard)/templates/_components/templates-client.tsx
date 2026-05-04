'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit2, Trash2, Copy, MessageSquare, ListChecks, FileCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/context';

export function TemplatesClient() {
  const { t } = useTranslation();

  const TEMPLATE_TYPES = [
    { value: 'message', label: t('templates.message'), icon: MessageSquare },
    { value: 'checklist', label: t('templates.checklist'), icon: ListChecks },
    { value: 'document', label: t('templates.document'), icon: FileCheck },
  ];

  const TEMPLATE_CATEGORIES = [
    { value: 'general', label: t('templates.category.general') },
    { value: 'welcome', label: t('templates.category.welcome') },
    { value: 'follow_up', label: t('templates.category.follow_up') },
    { value: 'showing', label: t('templates.category.showing') },
    { value: 'deposit', label: t('templates.category.deposit') },
    { value: 'deal', label: t('templates.category.deal') },
    { value: 'aftercare', label: t('templates.category.aftercare') },
  ];

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData: any) => {
    const url = editing ? `/api/templates/${editing.id}` : '/api/templates';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    if (res.ok) { toast.success(editing ? t('common.updated') : t('common.created')); setShowDialog(false); setEditing(null); fetchData(); }
    else toast.error(t('common.errorSave'));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('templates.deleteTemplate'))) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    toast.success(t('common.deleted')); fetchData();
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('common.copiedToClipboard'));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t('templates.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('templates.subtitle')}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowDialog(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> {t('templates.add')}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTypeFilter('')}
          className={cn('px-3 py-1.5 rounded-lg text-sm transition', !typeFilter ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>{t('common.all')}</button>
        {TEMPLATE_TYPES.map(tp => (
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
            const typeInfo = TEMPLATE_TYPES.find(tt => tt.value === tp.type);
            const catInfo = TEMPLATE_CATEGORIES.find(c => c.value === tp.category);
            return (
              <div key={tp.id} className="bg-white rounded-xl p-4 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
        <TemplateDialog template={editing} onSave={handleSave} onClose={() => { setShowDialog(false); setEditing(null); }} t={t} templateTypes={TEMPLATE_TYPES} templateCategories={TEMPLATE_CATEGORIES} />
      )}
    </div>
  );
}

function TemplateDialog({ template, onSave, onClose, t, templateTypes, templateCategories }: { template: any; onSave: (d: any) => void; onClose: () => void; t: (k: string) => string; templateTypes: any[]; templateCategories: any[] }) {
  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState(template?.type ?? 'message');
  const [category, setCategory] = useState(template?.category ?? 'general');
  const [content, setContent] = useState(template?.content ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await onSave({ name, type, category, content });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display font-bold">{template ? t('templates.editTemplate') : t('templates.newTemplate')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.type')}</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {templateTypes.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('kb.category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {templateCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.content')} *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button type="submit" disabled={saving || !name || !content}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
