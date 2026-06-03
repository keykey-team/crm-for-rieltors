'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { EditSelectionItems } from '@/features/edit-selection';
import { SendSelectionButton } from '@/features/send-selection';
import { addSelectionItems, getLeadMatches, getSelectionById, getSelections, removeSelection, updateSelection, type ClientSelection } from '@/entities/client-selection';
import { getProperties, type Property } from '@/entities/property';
import { confirmAction } from '@/shared/lib/confirm-action';
import { formatDate, formatDateTime, formatPrice } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';

type RankedProperty = {
  id: string;
  title: string;
  address?: string | null;
  district?: string | null;
  price?: number | null;
  currency?: string | null;
  score?: number;
};

export function ClientSelectionDetailsPage({ selectionId }: { selectionId: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [selection, setSelection] = useState<ClientSelection | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [draft, setDraft] = useState({ title: '', message: '', expiresAt: '' });
  const [metaSaving, setMetaSaving] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [propertyQuery, setPropertyQuery] = useState('');
  const [suggestedProperties, setSuggestedProperties] = useState<RankedProperty[]>([]);
  const [searchedProperties, setSearchedProperties] = useState<Property[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [addingItems, setAddingItems] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    loadSelection(selectionId)
      .then((data) => {
        if (!active) return;
        setSelection(data);
        setDraft({
          title: data.title ?? '',
          message: data.message ?? '',
          expiresAt: data.expiresAt ? data.expiresAt.slice(0, 16) : '',
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setSelection(null);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [selectionId]);

  useEffect(() => {
    if (!selection || !showAddPanel) return;
    let active = true;
    setLoadingSuggestions(true);
    getLeadMatches(selection.leadId, 12)
      .then((result) => {
        if (active) setSuggestedProperties(Array.isArray(result) ? (result as RankedProperty[]) : []);
      })
      .catch(() => {
        if (active) setSuggestedProperties([]);
      })
      .finally(() => {
        if (active) setLoadingSuggestions(false);
      });
    return () => {
      active = false;
    };
  }, [selection?.id, selection?.leadId, showAddPanel]);

  useEffect(() => {
    if (!showAddPanel) return;
    const normalized = propertyQuery.trim();
    if (!normalized) {
      setSearchedProperties([]);
      return;
    }
    let active = true;
    setLoadingSearch(true);
    getProperties({ search: normalized })
      .then((result) => {
        if (active) setSearchedProperties(result);
      })
      .catch(() => {
        if (active) setSearchedProperties([]);
      })
      .finally(() => {
        if (active) setLoadingSearch(false);
      });
    return () => {
      active = false;
    };
  }, [propertyQuery, showAddPanel]);

  const currentPropertyIds = useMemo(() => new Set(selection?.items.map((item) => item.propertyId) ?? []), [selection]);
  const suggestionItems = useMemo(() => suggestedProperties.filter((item) => !currentPropertyIds.has(item.id)), [currentPropertyIds, suggestedProperties]);
  const searchItems = useMemo(() => searchedProperties.filter((item) => !currentPropertyIds.has(item.id)), [currentPropertyIds, searchedProperties]);

  const replaceSelection = (updated: ClientSelection) => {
    setSelection(updated);
    setDraft({
      title: updated.title ?? '',
      message: updated.message ?? '',
      expiresAt: updated.expiresAt ? updated.expiresAt.slice(0, 16) : '',
    });
  };

  const saveDetails = async () => {
    if (!selection) return;
    setMetaSaving(true);
    try {
      const updated = await updateSelection(selection.id, {
        title: draft.title,
        message: draft.message,
        expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
      });
      replaceSelection(updated);
      toast.success(t('common.updated'));
    } catch {
      toast.error(t('common.errorSave'));
    } finally {
      setMetaSaving(false);
    }
  };

  const deleteCurrentSelection = async () => {
    if (!selection) return;
    const ok = await confirmAction(t('common.deleteConfirm'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    try {
      await removeSelection(selection.id);
      toast.success(t('common.deleted'));
      router.push('/selections');
    } catch {
      toast.error(t('common.error'));
    }
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedPropertyIds((current) => (
      current.includes(propertyId) ? current.filter((item) => item !== propertyId) : [...current, propertyId]
    ));
  };

  const addItemsToSelection = async () => {
    if (!selection || selectedPropertyIds.length === 0) return;
    setAddingItems(true);
    try {
      const updated = await addSelectionItems(selection.id, selectedPropertyIds);
      replaceSelection(updated);
      setSelectedPropertyIds([]);
      setPropertyQuery('');
      setShowAddPanel(false);
      toast.success(t('common.updated'));
    } catch {
      toast.error(t('common.errorSave'));
    } finally {
      setAddingItems(false);
    }
  };

  if (status === 'loading') {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!selection || status === 'error') {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: t('selections.title'), href: '/selections' }, { label: t('selections.notFound') }]} />
        <div className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center">
          <h1 className="text-2xl font-semibold">{t('selections.notFound')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('selections.selectionPageNotFound')}</p>
          <Link href="/selections" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            {t('selections.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t('selections.title'), href: '/selections' }, { label: selection.title || t('selections.untitled') }]} />

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link href="/selections" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('selections.backToList')}
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{selection.title || t('selections.untitled')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{selection.message || t('selections.noMessage')}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{t('selections.createdAt')}: {formatDateTime(selection.createdAt, locale)}</span>
              <span>{t('selections.expiresAt')}: {formatDate(selection.expiresAt, locale)}</span>
              <span>{t('selections.lastViewed')}: {formatDateTime(selection.lastViewedAt, locale)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowAddPanel((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium">
              <Plus className="h-4 w-4" />
              {t('selections.addProperties')}
            </button>
            <Link href={`/api/selections/${selection.id}/pdf`} target="_blank" rel="noreferrer" className="rounded-xl border border-border px-4 py-2 text-sm font-medium">
              PDF
            </Link>
            <button onClick={deleteCurrentSelection} className="rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive">
              {t('common.delete')}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-border bg-background/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium">{t('selections.shareBlockTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('selections.shareBlockDescription')}</p>
                </div>
                <SendSelectionButton slug={selection.publicSlug} clientName={[selection.lead?.firstName, selection.lead?.lastName].filter(Boolean).join(' ')} />
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-border bg-background/60 p-4">
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder={t('selections.title')} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" />
              <textarea value={draft.message} onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))} placeholder={t('selections.message')} rows={4} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" />
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('selections.expiresAt')}</label>
                  <input type="datetime-local" value={draft.expiresAt} onChange={(event) => setDraft((current) => ({ ...current, expiresAt: event.target.value }))} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" />
                </div>
                <button disabled={metaSaving} onClick={saveDetails} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                  {metaSaving ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </div>

            {showAddPanel ? (
              <aside className="rounded-[24px] border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{t('selections.addProperties')}</p>
                    <p className="text-xs text-muted-foreground">{t('selections.addPropertiesDescription')}</p>
                  </div>
                  <button onClick={() => setShowAddPanel(false)} className="text-xs text-muted-foreground">{t('common.cancel')}</button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('selections.recommendedProperties')}</p>
                    {loadingSuggestions ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
                    <div className="space-y-2">
                      {suggestionItems.slice(0, 6).map((property) => (
                        <PropertyOption
                          key={property.id}
                          title={property.title}
                          subtitle={property.address || property.district || t('selections.noAddress')}
                          meta={`${Math.round((property.score ?? 0) * 100)}%`}
                          selected={selectedPropertyIds.includes(property.id)}
                          onToggle={() => toggleProperty(property.id)}
                        />
                      ))}
                      {!loadingSuggestions && suggestionItems.length === 0 ? <p className="text-sm text-muted-foreground">{t('selections.noRecommendedProperties')}</p> : null}
                    </div>
                  </div>

                  <div>
                    <SearchInput value={propertyQuery} onChange={setPropertyQuery} placeholder={t('selections.searchProperties')} />
                    {loadingSearch ? <p className="mt-2 text-sm text-muted-foreground">{t('common.loading')}</p> : null}
                    <div className="mt-3 space-y-2">
                      {searchItems.slice(0, 8).map((property) => (
                        <PropertyOption
                          key={property.id}
                          title={property.title}
                          subtitle={property.address || property.district || property.city || t('selections.noAddress')}
                          meta={formatPrice(property.price ?? null, property.currency ?? 'USD', locale)}
                          selected={selectedPropertyIds.includes(property.id)}
                          onToggle={() => toggleProperty(property.id)}
                        />
                      ))}
                      {!loadingSearch && propertyQuery.trim() && searchItems.length === 0 ? <p className="text-sm text-muted-foreground">{t('selections.noPropertiesFound')}</p> : null}
                    </div>
                  </div>

                  <button disabled={addingItems || selectedPropertyIds.length === 0} onClick={addItemsToSelection} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                    {addingItems ? t('common.saving') : `${t('selections.addSelected')} (${selectedPropertyIds.length})`}
                  </button>
                </div>
              </aside>
            ) : null}

            <EditSelectionItems selection={selection} onUpdated={replaceSelection} />
          </div>

          <div className="space-y-4">
            <aside className="rounded-[24px] border border-border bg-background/60 p-4">
              <p className="text-sm font-medium">{t('selections.selectionOverview')}</p>
              <div className="mt-4 grid gap-3">
                <OverviewRow label={t('selections.client')} value={[selection.lead?.firstName, selection.lead?.lastName].filter(Boolean).join(' ') || t('selections.clientUnknown')} />
                <OverviewRow label={t('selections.itemsLabel')} value={`${selection.items.length}`} />
                <OverviewRow label={t('selections.views')} value={`${selection.viewsCount ?? 0}`} />
                <OverviewRow label={t('selections.reactions')} value={`${selection.items.filter((item) => item.clientReaction).length}`} />
                <OverviewRow label={t('selections.wantToViewCount')} value={`${selection.items.filter((item) => item.clientReaction === 'want_to_view').length}`} />
              </div>
            </aside>

            <aside className="rounded-[24px] border border-border bg-background/60 p-4">
              <p className="text-sm font-medium">{t('selections.activitySummary')}</p>
              <div className="mt-4 grid gap-3">
                <OverviewRow label={t('selections.createdAt')} value={formatDateTime(selection.createdAt, locale)} />
                <OverviewRow label={t('selections.lastViewed')} value={formatDateTime(selection.lastViewedAt, locale)} />
                <OverviewRow label={t('selections.expiresAt')} value={formatDate(selection.expiresAt, locale)} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

async function loadSelection(selectionId: string) {
  try {
    return await getSelectionById(selectionId);
  } catch {
    const items = await getSelections();
    const fallback = items.find((item) => item.id === selectionId);
    if (!fallback) throw new Error('Selection not found');
    return fallback;
  }
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-card py-2.5 pl-3 pr-3 text-sm" />
    </div>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PropertyOption({ title, subtitle, meta, selected, onToggle }: { title: string; subtitle: string; meta: string; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/40'}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="shrink-0 text-xs font-medium text-muted-foreground">{meta}</div>
    </button>
  );
}