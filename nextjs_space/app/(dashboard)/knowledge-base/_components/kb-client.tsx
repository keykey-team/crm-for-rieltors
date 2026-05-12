'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Search, FileText, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { KB_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { confirmAction } from '@/lib/confirm-action';

export function KBClient() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const res = await fetch(`/api/knowledge-base?${params.toString()}`);
    const data = await res.json();
    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, category]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleSave = async (data: any) => {
    if (editArticle) {
      await fetch(`/api/knowledge-base/${editArticle.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
      await fetch('/api/knowledge-base', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    setDialogOpen(false); setEditArticle(null); fetchArticles();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction(t('common.delete') + '?', { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">{t('kb.title')}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{t('kb.subtitle')}</p>
            </div>
          </div>
        </div>
        <button onClick={() => { setEditArticle(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t('kb.addArticle')}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t('kb.searchPlaceholder')} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="">{t('common.allCategories')}</option>
          {KB_CATEGORIES.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>
      ) : (articles?.length ?? 0) === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('kb.noArticles')}</div>
      ) : (
        <div className="space-y-3">
          {(articles ?? []).map((a: any) => (
            <div key={a?.id} className="bg-card rounded-2xl overflow-hidden transition" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30" onClick={() => setExpanded(expanded === a?.id ? null : a?.id)}>
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a?.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{KB_CATEGORIES.find((c: any) => c.value === a?.category)?.label ?? a?.category}</span>
                    <span>•</span>
                    <span>{formatDate(a?.createdAt)}</span>
                    {a?.author?.name && <><span>•</span><span>{a.author.name}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditArticle(a); setDialogOpen(true); }} className="p-2 rounded-lg hover:bg-muted">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(a?.id); }} className="p-2 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                  {expanded === a?.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expanded === a?.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="prose prose-sm max-w-none mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{a?.content}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => { setDialogOpen(false); setEditArticle(null); }}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <KBDialog article={editArticle} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditArticle(null); }} t={t} />
          </div>
        </div>
      )}
    </div>
  );
}

function KBDialog({ article, onSave, onClose, t }: { article: any; onSave: (d: any) => void; onClose: () => void; t: (k: string) => string }) {
  const [form, setForm] = useState({ title: article?.title ?? '', content: article?.content ?? '', category: article?.category ?? 'general' });
  const [saving, setSaving] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="font-display font-bold text-lg">{article ? t('kb.editArticle') : t('kb.addArticle')}</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><span className="text-lg">×</span></button>
      </div>
      <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); }} className="p-6 space-y-4">
        <div><label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div><label className="text-sm font-medium mb-1 block">{t('kb.category')}</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
            {KB_CATEGORIES.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-medium mb-1 block">{t('common.content')} *</label>
          <textarea rows={8} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required
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
    </>
  );
}
