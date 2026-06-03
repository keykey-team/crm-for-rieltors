'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Pencil, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateSelectionPanel } from '@/features/create-selection';
import { EditSelectionItems } from '@/features/edit-selection';
import { SendSelectionButton } from '@/features/send-selection';
import { removeSelection, SelectionCard, updateSelection, useSelections } from '@/entities/client-selection';
import type { ClientSelection } from '@/entities/client-selection';
import { useTranslation } from '@/shared/lib/i18n/context';
import { formatDateTime } from '@/shared/lib/format';
import { SelectionDetailsForm, type SelectionDetailsDraft } from './SelectionDetailsForm';
import { SelectionFilters } from './SelectionFilters';
import { matchesSelectionFilter, type SelectionFilter } from '../model/selectionFilters';

export function ClientSelectionsScreen() {
  const { t } = useTranslation();
  const [leadId, setLeadId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SelectionFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SelectionDetailsDraft>({ title: '', message: '', expiresAt: '' });
  const { items, loading, reload } = useSelections(leadId || undefined);

  const filteredItems = useMemo(() => (
    items.filter((item) => matchesSelection(item, query) && matchesSelectionFilter(item, filter))
  ), [filter, items, query]);
  const stats = useMemo(() => ({
    total: items.length,
    objects: items.reduce((sum, item) => sum + item.items.length, 0),
    views: items.reduce((sum, item) => sum + (item.viewsCount ?? 0), 0),
    reactions: items.reduce((sum, item) => sum + item.items.filter((entry) => entry.clientReaction).length, 0),
  }), [items]);

  const startEdit = (selection: ClientSelection) => {
    setExpandedId(selection.id);
    setEditingId(selection.id);
    setDraft({
      title: selection.title ?? '',
      message: selection.message ?? '',
      expiresAt: selection.expiresAt ? selection.expiresAt.slice(0, 16) : '',
    });
  };

  const saveDetails = async (selection: ClientSelection) => {
    await updateSelection(selection.id, {
      title: draft.title,
      message: draft.message,
      expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
    });
    setEditingId(null);
    toast.success(t('common.updated'));
    await reload();
  };

  const deleteSelection = async (selection: ClientSelection) => {
    if (!window.confirm(t('common.deleteConfirm'))) return;
    await removeSelection(selection.id);
    toast.success(t('common.deleted'));
    await reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t('selections.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('selections.subtitle')}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[220px_180px_220px_auto]">
          <SearchInput value={query} onChange={setQuery} placeholder={t('selections.search')} />
          <SelectionFilters value={filter} onChange={setFilter} t={t} />
          <input value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder={t('selections.filterLead')} className="px-3 py-2 border border-border rounded-lg bg-card text-sm" />
          <CreateSelectionPanel onCreated={reload} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label={t('selections.total')} value={stats.total} />
        <Stat label={t('selections.totalObjects')} value={stats.objects} />
        <Stat label={t('selections.totalViews')} value={stats.views} />
        <Stat label={t('selections.totalReactions')} value={stats.reactions} />
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
      {!loading && filteredItems.length === 0 ? <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">{t('selections.noResults')}</p> : null}
      {!loading && filteredItems.map((item) => (
        <SelectionCard key={item.id} selection={item}>
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="px-3 py-1.5 border rounded-lg text-sm">{t('selections.details')}</button>
            <button onClick={() => startEdit(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm"><Pencil className="h-3.5 w-3.5" />{t('common.edit')}</button>
            <Link href={`/api/selections/${item.id}/pdf`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm"><FileText className="h-3.5 w-3.5" />PDF</Link>
            <button onClick={() => deleteSelection(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/40 text-destructive rounded-lg text-sm"><Trash2 className="h-3.5 w-3.5" />{t('common.delete')}</button>
          </div>
          {expandedId === item.id ? (
            <div className="space-y-3 border-t border-border/60 pt-3">
              <SendSelectionButton slug={item.publicSlug} clientName={[item.lead?.firstName, item.lead?.lastName].filter(Boolean).join(' ')} />
              <p className="text-xs text-muted-foreground">{t('selections.createdAt')}: {formatDateTime(item.createdAt)} · {t('selections.expiresAt')}: {formatDateTime(item.expiresAt)}</p>
              {editingId === item.id ? <SelectionDetailsForm draft={draft} setDraft={setDraft} onSave={() => saveDetails(item)} onCancel={() => setEditingId(null)} t={t} /> : null}
              <EditSelectionItems selection={item} onUpdated={reload} />
            </div>
          ) : null}
        </SelectionCard>
      ))}
    </div>
  );
}

function matchesSelection(selection: ClientSelection, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [selection.title, selection.message, selection.lead?.firstName, selection.lead?.lastName, ...selection.items.map((item) => item.property.title)]
    .filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(normalized);
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-9 py-2 border border-border rounded-lg bg-card text-sm" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
