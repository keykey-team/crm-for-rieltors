'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Building, LayoutGrid, List, X, MapPin, Maximize, Layers, DollarSign, Edit2, Grid3X3, Trash2, BedDouble } from 'lucide-react';
import { PropertyCard } from '@/widgets/properties/ui/property-card';
import { PropertyDialog } from '@/widgets/properties/ui/property-dialog';
import { ChessGrid } from '@/widgets/properties/ui/chess-grid';
import { PropertyPriceHistoryWidget } from '@/widgets/property-price-history';
import { AddPricePointModal } from '@/features/add-price-point';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { formatPrice } from '@/shared/lib/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { usePropertiesPage } from '@/widgets/properties/model/use-properties-page';
import { getPropertyProfile, usePropertyOptions } from '@/entities/property';
import type { PropertyProfile } from '@/entities/property';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getActivityActionLabel(action: string, t: (key: string) => string) {
  const normalized = action.toLowerCase();
  if (normalized === 'price_change') return t('properties.preview.activity.priceChange');
  if (normalized === 'create') return t('properties.preview.activity.create');
  if (normalized === 'update') return t('properties.preview.activity.update');
  if (normalized === 'delete') return t('properties.preview.activity.delete');
  return t('properties.preview.activity.other');
}

export function PropertiesClient() {
  const { t } = useTranslation();
  const [addPointPropertyId, setAddPointPropertyId] = useState<string | null>(null);
  const [previewProfile, setPreviewProfile] = useState<PropertyProfile | null>(null);
  const [previewProfileLoading, setPreviewProfileLoading] = useState(false);
  const { typeOptions, statusOptions, dealTypeOptions, publicationChannelOptions, publicationStatusOptions } = usePropertyOptions(t);
  const getDealTypeLabel = (value: string) => dealTypeOptions.find((item) => item.value === value)?.label || value;
  const {
    properties,
    ownershipSegment,
    setOwnershipSegment,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dealTypeFilter,
    setDealTypeFilter,
    publicationChannelFilter,
    setPublicationChannelFilter,
    publicationStatusFilter,
    setPublicationStatusFilter,
    dialogOpen,
    setDialogOpen,
    editProp,
    setEditProp,
    view,
    setView,
    chessGridPropId,
    setChessGridPropId,
    chessGridFloors,
    setChessGridFloors,
    chessGridTitle,
    setChessGridTitle,
    previewProp,
    setPreviewProp,
    fetchProps,
    handleSave,
    handleDelete,
    handleOwnershipChange,
  } = usePropertiesPage(t);

  const isPotentialProperty = (status?: string | null) => status === 'inactive';

  useEffect(() => {
    if (!previewProp?.id) {
      setPreviewProfile(null);
      return;
    }

    let active = true;
    setPreviewProfileLoading(true);
    getPropertyProfile(previewProp.id)
      .then((data) => {
        if (active) setPreviewProfile(data);
      })
      .catch(() => {
        if (active) setPreviewProfile(null);
      })
      .finally(() => {
        if (active) setPreviewProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [previewProp?.id]);

  const previewProfileResolved = previewProp && previewProfile?.id === previewProp.id ? previewProfile : null;
  const previewProfileDeals = previewProfileResolved?.deals ?? [];
  const previewProfileShowings = previewProfileResolved?.showings ?? [];
  const previewProfileActivity = previewProfileResolved?.activity;
  const previewPriceStats = previewProfileResolved?.priceStats ?? null;
  const previewMetrics = previewProfileResolved?.metrics ?? null;

  const groupedActivity = useMemo(() => {
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return (previewProfileActivity ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .reduce<Array<{ label: string; items: NonNullable<typeof previewProfileActivity> }>>((acc, item) => {
        const current = new Date(item.createdAt);
        const currentDay = startOfDay(current);
        let label = current.toLocaleDateString();
        if (currentDay.getTime() === today.getTime()) label = t('properties.preview.today');
        if (currentDay.getTime() === yesterday.getTime()) label = t('properties.preview.yesterday');

        const bucket = acc.find((entry) => entry.label === label);
        if (bucket) {
          bucket.items.push(item);
        } else {
          acc.push({ label, items: [item] });
        }
        return acc;
      }, []);
  }, [previewProfileActivity, t]);

  const previewPublicationEntries = useMemo(
    () =>
      (previewProfileResolved?.publications ?? []).map((publication) => ({
        ...publication,
        channelLabel: publicationChannelOptions.find((item) => item.value === publication.channel)?.label || publication.channel,
        statusLabel: publicationStatusOptions.find((item) => item.value === publication.status)?.label || publication.status,
      })),
    [previewProfileResolved?.publications, publicationChannelOptions, publicationStatusOptions],
  );

  const activeFilters = useMemo(() => {
    const items: Array<{ key: string; label: string; onClear: () => void }> = [];

    if (search.trim()) {
      items.push({
        key: 'search',
        label: `${t('properties.filters.search')}: ${search.trim()}`,
        onClear: () => setSearch(''),
      });
    }

    if (typeFilter) {
      items.push({
        key: 'type',
        label: `${t('properties.filters.type')}: ${typeOptions.find((item) => item.value === typeFilter)?.label || typeFilter}`,
        onClear: () => setTypeFilter(''),
      });
    }

    if (statusFilter) {
      items.push({
        key: 'status',
        label: `${t('properties.filters.status')}: ${statusOptions.find((item) => item.value === statusFilter)?.label || statusFilter}`,
        onClear: () => setStatusFilter(''),
      });
    }

    if (dealTypeFilter) {
      items.push({
        key: 'dealType',
        label: `${t('properties.filters.dealType')}: ${dealTypeOptions.find((item) => item.value === dealTypeFilter)?.label || dealTypeFilter}`,
        onClear: () => setDealTypeFilter(''),
      });
    }

    if (publicationChannelFilter) {
      items.push({
        key: 'publicationChannel',
        label: `${t('properties.filters.publicationChannel')}: ${publicationChannelOptions.find((item) => item.value === publicationChannelFilter)?.label || publicationChannelFilter}`,
        onClear: () => setPublicationChannelFilter(''),
      });
    }

    if (publicationStatusFilter) {
      items.push({
        key: 'publicationStatus',
        label: `${t('properties.filters.publicationStatus')}: ${publicationStatusOptions.find((item) => item.value === publicationStatusFilter)?.label || publicationStatusFilter}`,
        onClear: () => setPublicationStatusFilter(''),
      });
    }

    return items;
  }, [
    dealTypeFilter,
    dealTypeOptions,
    publicationChannelFilter,
    publicationChannelOptions,
    publicationStatusFilter,
    publicationStatusOptions,
    search,
    setDealTypeFilter,
    setPublicationChannelFilter,
    setPublicationStatusFilter,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    statusOptions,
    t,
    typeFilter,
    typeOptions,
  ]);

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setDealTypeFilter('');
    setPublicationChannelFilter('');
    setPublicationStatusFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">
              <HintTooltip text={t('hints.properties')} position="bottom">{t('properties.title')}</HintTooltip>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('properties.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setEditProp(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('properties.addProperty')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOwnershipSegment('my')}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-semibold border transition-all',
              ownershipSegment === 'my'
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border/60 dark:border-border/40 bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {t('properties.segment.my')}
          </button>
          <button
            onClick={() => setOwnershipSegment('potential')}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-semibold border transition-all',
              ownershipSegment === 'potential'
                ? 'border-amber-300 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'border-border/60 dark:border-border/40 bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {t('properties.segment.potential')}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            placeholder={t('properties.searchPlaceholder')} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('common.allTypes')}</option>
            {typeOptions.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('common.allStatuses')}</option>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={dealTypeFilter} onChange={(e) => setDealTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('common.allDealTypes')}</option>
            {dealTypeOptions.map((item) => <option key={item.value} value={item.value}>{getDealTypeLabel(item.value)}</option>)}
          </select>
          <select value={publicationChannelFilter} onChange={(e) => setPublicationChannelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('properties.filters.allPublicationChannels')}</option>
            {publicationChannelOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={publicationStatusFilter} onChange={(e) => setPublicationStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('properties.filters.allPublicationStatuses')}</option>
            {publicationStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <div className="flex bg-card rounded-xl border border-border/60 dark:border-border/40 p-0.5 flex-shrink-0 ml-auto">
            <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-all', view === 'grid' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-all', view === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        {activeFilters.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t('properties.filters.active')}</span>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.onClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-muted transition"
              >
                <span>{filter.label}</span>
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t('properties.filters.clearAll')}
            </button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-card rounded-2xl border border-border/60 dark:border-border/40 animate-pulse" />)}
        </div>
      ) : (properties?.length ?? 0) === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#073B34]/10 to-emerald-800/10 flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-[#073B34] dark:text-emerald-400" />
          </div>
          <p className="text-muted-foreground font-medium">
            {activeFilters.length ? t('properties.noPropertiesFiltered') : t('properties.noProperties')}
          </p>
          {activeFilters.length ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              {t('properties.filters.clearAll')}
            </button>
          ) : null}
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {(properties ?? []).map((p: any) => (
            <PropertyCard key={p?.id} property={p} view={view}
              ownership={isPotentialProperty(p?.status) ? 'potential' : 'my'}
              typeOptions={typeOptions}
              statusOptions={statusOptions}
              dealTypeOptions={dealTypeOptions}
              publicationChannelOptions={publicationChannelOptions}
              onOwnershipChange={(target) => handleOwnershipChange(p, target)}
              onEdit={() => setPreviewProp(p)}
              onDelete={() => handleDelete(p?.id)}
              onChessGrid={() => { setChessGridPropId(p?.id); setChessGridFloors(p?.totalFloors || 10); setChessGridTitle(p?.title || ''); }} />
          ))}
        </div>
      )}
      {dialogOpen && <PropertyDialog property={editProp} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditProp(null); }} />}
      {chessGridPropId && <ChessGrid propertyId={chessGridPropId} propertyTitle={chessGridTitle} totalFloors={chessGridFloors} onClose={() => setChessGridPropId(null)} />}

      {/* Quick Preview Modal — Apple Sheet style */}
      {previewProp && (() => {
        const p = previewProp;
        const tp = typeOptions.find((x) => x.value === p.type);
        const st = statusOptions.find((x) => x.value === p.status);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPreviewProp(null)}>
            <div className="bg-card rounded-3xl border border-border/60 dark:border-border/40 w-full max-w-lg mx-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              {/* Photo */}
              {p.photos && p.photos.length > 0 ? (
                <div className="h-52 overflow-hidden relative">
                  <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button onClick={() => setPreviewProp(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="font-display font-bold text-lg text-white drop-shadow-sm">{p.title || t('properties.noTitle')}</h2>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-[#073B34]/30 dark:to-emerald-900/20 flex items-center justify-center relative">
                    <Building className="w-14 h-14 text-emerald-300 dark:text-emerald-600" />
                    <button onClick={() => setPreviewProp(null)} className="absolute top-3 right-3 p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="px-5 pt-3">
                    <h2 className="font-display font-bold text-lg">{p.title || t('properties.noTitle')}</h2>
                  </div>
                </>
              )}
              {/* Details */}
              <div className="p-5 space-y-4">
                 <div className="flex items-center gap-2 flex-wrap">
                  {tp && <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">{tp.label}</span>}
                  {st && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: (st.color ?? '#72BF78') + '15', color: st.color ?? '#72BF78' }}>{st.label}</span>}
                  {p.dealTypes?.map((dealType: string) => (
                    <span key={dealType} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                      {getDealTypeLabel(dealType)}
                    </span>
                  ))}
                </div>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">{t('common.details')}</TabsTrigger>
                    <TabsTrigger value="priceHistory">{t('priceHistory.tabTitle')}</TabsTrigger>
                    <TabsTrigger value="relations">{t('properties.preview.relationsTab')}</TabsTrigger>
                    <TabsTrigger value="activity">{t('properties.preview.activityTab')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {p.address && (
                        <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" /> {p.address}
                        </div>
                      )}
                      {p.price && (
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl p-3">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">{t('common.price')}</p>
                          <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(p.price, p.currency ?? 'USD')}</p>
                        </div>
                      )}
                      {p.area && (
                        <div className="bg-blue-500/10 dark:bg-blue-500/15 rounded-xl p-3">
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-0.5">{t('common.area')}</p>
                          <p className="font-mono font-bold text-blue-700 dark:text-blue-300">{p.area} м²</p>
                        </div>
                      )}
                      {p.rooms != null && (
                        <div className="bg-[#073B34]/10 dark:bg-emerald-500/15 rounded-xl p-3">
                          <p className="text-[10px] text-violet-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">{t('common.rooms')}</p>
                          <p className="font-mono font-bold text-[#073B34] dark:text-emerald-300">{p.rooms}</p>
                        </div>
                      )}
                      {p.floor && (
                        <div className="bg-amber-500/10 dark:bg-amber-500/15 rounded-xl p-3">
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-0.5">{t('common.floor')}</p>
                          <p className="font-mono font-bold text-amber-700 dark:text-amber-300">{p.floor}{p.totalFloors ? `/${p.totalFloors}` : ''}</p>
                        </div>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                    )}
                    {previewPublicationEntries.length ? (
                      <div className="rounded-2xl border border-border/60 dark:border-border/40 p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">{t('properties.preview.publications')}</p>
                        <div className="grid grid-cols-1 gap-2">
                          {previewPublicationEntries.slice(0, 3).map((publication) => (
                            <div key={publication.id ?? `${publication.channel}-${publication.status}-${publication.url ?? ''}`} className="rounded-xl border border-border/60 px-3 py-2 text-[11px]">
                              <div className="flex items-center gap-1.5 font-medium">
                                <span>{publication.channelLabel}</span>
                                <span className="text-muted-foreground">{publication.statusLabel}</span>
                              </div>
                              {publication.publishedAt ? <p className="mt-1 text-muted-foreground">{t('properties.publications.publishedAt')}: {new Date(publication.publishedAt).toLocaleString()}</p> : null}
                              {publication.lastSyncedAt ? <p className="mt-1 text-muted-foreground">{t('properties.publications.lastSyncedAt')}: {new Date(publication.lastSyncedAt).toLocaleString()}</p> : null}
                            </div>
                          ))}
                          {previewPublicationEntries.length > 3 ? (
                            <span className="inline-flex items-center justify-center rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              +{previewPublicationEntries.length - 3}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </TabsContent>
                  <TabsContent value="priceHistory">
                    <PropertyPriceHistoryWidget propertyId={p.id} t={t} />
                  </TabsContent>
                  <TabsContent value="relations" className="space-y-3">
                    {previewProfileLoading ? (
                      <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
                    ) : (
                      <>
                        {previewPriceStats ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.currentPrice')}</p>
                              <p className="font-semibold text-sm">{formatPrice(previewPriceStats.current, previewPriceStats.currency)}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.priceChanges')}</p>
                              <p className="font-semibold text-sm">{previewPriceStats.changesCount}</p>
                            </div>
                          </div>
                        ) : null}

                        {previewMetrics ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.dealsTotal')}</p>
                              <p className="font-semibold text-sm">{previewMetrics.dealsTotal}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.dealsVolume')}</p>
                              <p className="font-semibold text-sm">{formatPrice(previewMetrics.dealsAmountSum, p.currency ?? 'USD')}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.showingsUpcoming')}</p>
                              <p className="font-semibold text-sm">{previewMetrics.showingsUpcoming}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 dark:border-border/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('properties.preview.showingsCompleted')}</p>
                              <p className="font-semibold text-sm">{previewMetrics.showingsCompleted}</p>
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">{t('properties.preview.deals')}</p>
                          {previewProfileDeals.length ? (
                            <div className="space-y-1.5">
                              {previewProfileDeals.slice(0, 5).map((deal) => (
                                <div key={deal.id} className="rounded-lg border border-border/60 dark:border-border/40 px-3 py-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium truncate">{deal.title}</span>
                                    <span className="text-muted-foreground">{deal.stage || '-'}</span>
                                  </div>
                                  {deal.amount ? <p className="text-muted-foreground mt-0.5">{formatPrice(deal.amount, deal.currency ?? 'USD')}</p> : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">{t('properties.preview.emptyDeals')}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">{t('properties.preview.showings')}</p>
                          {previewProfileShowings.length ? (
                            <div className="space-y-1.5">
                              {previewProfileShowings.slice(0, 5).map((showing) => (
                                <div key={showing.id} className="rounded-lg border border-border/60 dark:border-border/40 px-3 py-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium">{new Date(showing.scheduledAt).toLocaleString()}</span>
                                    <span className="text-muted-foreground">{showing.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">{t('properties.preview.emptyShowings')}</p>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>
                  <TabsContent value="activity" className="space-y-2">
                    {previewProfileLoading ? (
                      <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
                    ) : groupedActivity.length ? (
                      groupedActivity.map((group) => (
                        <div key={group.label} className="space-y-1.5">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground px-1">{group.label}</p>
                          {group.items.slice(0, 8).map((item) => (
                            <div key={item.id} className="rounded-lg border border-border/60 dark:border-border/40 px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium">{getActivityActionLabel(item.action, t)}</p>
                                <p className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString()}</p>
                              </div>
                              {item.details ? <p className="text-xs text-muted-foreground mt-1">{item.details}</p> : null}
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('properties.preview.emptyActivity')}</p>
                    )}
                  </TabsContent>
                </Tabs>
                {/* Actions */}
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-border/60 dark:border-border/40">
                  <Link
                    href={`/properties/${p.id}`}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-card border border-border/60 dark:border-border/40 rounded-xl text-sm font-semibold hover:bg-muted transition active:scale-95"
                  >
                    {t('properties.preview.openProfile')}
                  </Link>
                  <button onClick={() => { setPreviewProp(null); setEditProp(p); setDialogOpen(true); }}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95">
                    <Edit2 className="w-3.5 h-3.5" /> {t('common.edit')}
                  </button>
                  <button onClick={() => setAddPointPropertyId(p.id)}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-card border border-border/60 dark:border-border/40 rounded-xl text-sm font-semibold hover:bg-muted transition active:scale-95">
                    <DollarSign className="w-3.5 h-3.5" /> {t('priceHistory.addPoint')}
                  </button>
                  {p.totalFloors && (
                    <button onClick={() => { setPreviewProp(null); setChessGridPropId(p.id); setChessGridFloors(p.totalFloors || 10); setChessGridTitle(p.title || ''); }}
                      className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-card border border-border/60 dark:border-border/40 rounded-xl text-sm font-semibold hover:bg-muted transition active:scale-95">
                      <Grid3X3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('properties.chessGrid')}</span>
                    </button>
                  )}
                  <button onClick={() => { setPreviewProp(null); handleDelete(p.id); }}
                    className="ml-auto flex items-center gap-2 px-3 sm:px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition active:scale-95">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {addPointPropertyId ? (
        <AddPricePointModal
          propertyId={addPointPropertyId}
          t={t}
          onClose={() => setAddPointPropertyId(null)}
          onSaved={async () => {
            const items = await fetchProps();
            const selected = items?.find((item) => item.id === addPointPropertyId) ?? null;
            setPreviewProp(selected);
          }}
        />
      ) : null}
    </div>
  );
}
