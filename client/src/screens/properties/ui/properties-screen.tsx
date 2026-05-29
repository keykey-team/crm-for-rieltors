'use client';
import { useState } from 'react';
import { Plus, Search, Building, LayoutGrid, List, X, MapPin, Maximize, Layers, DollarSign, Edit2, Grid3X3, Trash2, BedDouble } from 'lucide-react';
import { PropertyCard } from '@/widgets/properties/ui/property-card';
import { PropertyDialog } from '@/widgets/properties/ui/property-dialog';
import { ChessGrid } from '@/widgets/properties/ui/chess-grid';
import { PropertyPriceHistoryWidget } from '@/widgets/property-price-history';
import { AddPricePointModal } from '@/features/add-price-point';
import { PROPERTY_DEAL_TYPES, PROPERTY_TYPES, PROPERTY_STATUSES } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { formatPrice } from '@/shared/lib/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { usePropertiesPage } from '@/widgets/properties/model/use-properties-page';

export function PropertiesClient() {
  const { t } = useTranslation();
  const [addPointPropertyId, setAddPointPropertyId] = useState<string | null>(null);
  const getDealTypeLabel = (value: string) => value === 'sale' ? t('leads.dialog.needSell') : value === 'rent' ? t('leads.dialog.needRent') : value;
  const {
    properties,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dealTypeFilter,
    setDealTypeFilter,
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
  } = usePropertiesPage(t);

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
            {PROPERTY_TYPES.map((tp: any) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('common.allStatuses')}</option>
            {PROPERTY_STATUSES.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={dealTypeFilter} onChange={(e) => setDealTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border/60 dark:border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0">
            <option value="">{t('common.allDealTypes')}</option>
            {PROPERTY_DEAL_TYPES.map((item) => <option key={item.value} value={item.value}>{getDealTypeLabel(item.value)}</option>)}
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
          <p className="text-muted-foreground font-medium">{t('properties.noProperties')}</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {(properties ?? []).map((p: any) => (
            <PropertyCard key={p?.id} property={p} view={view}
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
        const tp = PROPERTY_TYPES.find((x: any) => x.value === p.type);
        const st = PROPERTY_STATUSES.find((x: any) => x.value === p.status);
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
                  {tp && <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">{t(`const.propertyType.${p.type}`) || tp.label}</span>}
                  {st && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: st.color + '15', color: st.color }}>{t(`const.propertyStatus.${p.status}`) || st.label}</span>}
                  {p.dealTypes?.map((dealType: string) => (
                    <span key={dealType} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                      {getDealTypeLabel(dealType)}
                    </span>
                  ))}
                </div>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">{t('common.details')}</TabsTrigger>
                    <TabsTrigger value="priceHistory">{t('priceHistory.tabTitle')}</TabsTrigger>
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
                  </TabsContent>
                  <TabsContent value="priceHistory">
                    <PropertyPriceHistoryWidget propertyId={p.id} t={t} />
                  </TabsContent>
                </Tabs>
                {/* Actions */}
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-border/60 dark:border-border/40">
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
