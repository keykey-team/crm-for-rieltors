'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FileText, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateSelectionPanel } from '@/features/create-selection';
import { SelectionCard, removeSelection, useSelections, type ClientSelection } from '@/entities/client-selection';
import { getLeads, type Lead } from '@/entities/lead';
import { confirmAction } from '@/shared/lib/confirm-action';
import { formatDateTime } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';

type SelectionFilter = 'all' | 'viewed' | 'not_viewed' | 'with_reactions' | 'want_to_view' | 'active' | 'expired';

const filterOptions: SelectionFilter[] = ['all', 'viewed', 'not_viewed', 'with_reactions', 'want_to_view', 'active', 'expired'];

export function ClientSelectionsWorkspace() {
  const { t } = useTranslation();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SelectionFilter>('all');
  const { items, loading, reload, removeSelectionFromList } = useSelections(leadId || undefined);

  useEffect(() => {
    getLeads().then(setLeads).catch(() => setLeads([]));
  }, []);

  const filteredItems = useMemo(() => (
    items.filter((item) => matchesSelection(item, query) && matchesSelectionFilter(item, filter))
  ), [filter, items, query]);

  const stats = useMemo(() => ({
    total: items.length,
    objects: items.reduce((sum, item) => sum + item.items.length, 0),
    views: items.reduce((sum, item) => sum + (item.viewsCount ?? 0), 0),
    reactions: items.reduce((sum, item) => sum + item.items.filter((entry) => entry.clientReaction).length, 0),
  }), [items]);

  const selectedLead = leads.find((lead) => lead.id === leadId) ?? null;

  const deleteSelection = async (selection: ClientSelection) => {
    const ok = await confirmAction(t('common.deleteConfirm'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await removeSelection(selection.id);
    removeSelectionFromList(selection.id);
    toast.success(t('common.deleted'));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('selections.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('selections.subtitle')}</p>
          </div>
          <CreateSelectionPanel onCreated={reload} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('selections.total')} value={stats.total} />
          <StatCard label={t('selections.totalObjects')} value={stats.objects} />
          <StatCard label={t('selections.totalViews')} value={stats.views} />
          <StatCard label={t('selections.totalReactions')} value={stats.reactions} />
        </div>
        <div className="mt-5 border-t border-border pt-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_auto] lg:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder={t('selections.search')} />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as SelectionFilter)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>{t(`selections.filter.${option}`)}</option>
              ))}
            </select>
            <select
              value={leadId}
              onChange={(event) => setLeadId(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">{t('selections.allClients')}</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {[lead.firstName, lead.lastName].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground lg:text-right">
              {t('selections.filteredResults')}: {filteredItems.length}
            </div>
          </div>
          {selectedLead ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {t('selections.filteredByClient')}: {[selectedLead.firstName, selectedLead.lastName].filter(Boolean).join(' ')}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        {loading ? <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">{t('common.loading')}</p> : null}
        {!loading && filteredItems.length === 0 ? <EmptyState label={t('selections.noResults')} /> : null}
        {!loading && filteredItems.map((item) => (
          <SelectionCard key={item.id} selection={item} onClick={() => router.push(`/selections/${item.id}`)}>
            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              {item.items.slice(0, 3).map((selectionItem) => (
                <span key={selectionItem.id} className="rounded-md bg-muted/50 px-2 py-1">
                  {selectionItem.property.title}
                </span>
              ))}
              {item.items.length > 3 ? (
                <span className="rounded-md bg-muted/50 px-2 py-1">+{item.items.length - 3}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 border-t border-border/60 pt-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{t('selections.createdAt')}: {formatDateTime(item.createdAt)}</span>
                <span>{t('selections.lastViewed')}: {formatDateTime(item.lastViewedAt)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/selections/${item.id}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary/35 hover:text-primary">
                  {t('selections.openDetails')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={item.publicSlug ? `/s/${item.publicSlug}` : '#'} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-4 w-4" />
                  {t('selections.openPublic')}
                </Link>
                <Link href={`/api/selections/${item.id}/pdf`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <FileText className="h-4 w-4" />
                  PDF
                </Link>
                <button onClick={(event) => { event.stopPropagation(); void deleteSelection(item); }} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive/90 hover:border-destructive/35 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </SelectionCard>
        ))}
      </section>
    </div>
  );
}

function matchesSelection(selection: ClientSelection, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    selection.title,
    selection.message,
    selection.lead?.firstName,
    selection.lead?.lastName,
    ...selection.items.flatMap((item) => [item.property.title, item.property.address, item.property.district]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalized);
}

function matchesSelectionFilter(selection: ClientSelection, filter: SelectionFilter) {
  const views = selection.viewsCount ?? 0;
  const reactions = selection.items.filter((item) => item.clientReaction).length;
  const wantsView = selection.items.some((item) => item.clientReaction === 'want_to_view');
  const expiresAt = selection.expiresAt ? new Date(selection.expiresAt).getTime() : null;
  const expired = expiresAt !== null && expiresAt < Date.now();

  if (filter === 'viewed') return views > 0;
  if (filter === 'not_viewed') return views === 0;
  if (filter === 'with_reactions') return reactions > 0;
  if (filter === 'want_to_view') return wantsView;
  if (filter === 'active') return !expired;
  if (filter === 'expired') return expired;
  return true;
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm" />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
