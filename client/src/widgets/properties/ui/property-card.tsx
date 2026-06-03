'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Building, MapPin, Maximize, Layers, Edit2, Trash2, Grid3X3, BedDouble, ArrowUpRight, RadioTower } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import type { Property, PropertyOption } from '@/entities/property';
import { PropertyStatusBadge, PropertyTypeBadge } from '@/entities/property';
import { PriceHistoryBadge } from '@/entities/property-price-history';
import { cn } from '@/shared/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';

interface Props {
  property: Property;
  view: 'grid' | 'list';
  ownership: 'my' | 'potential';
  typeOptions: PropertyOption[];
  statusOptions: PropertyOption[];
  dealTypeOptions: PropertyOption[];
  publicationChannelOptions: PropertyOption[];
  onOwnershipChange: (next: 'my' | 'potential') => void;
  onEdit: () => void;
  onDelete: () => void;
  onChessGrid?: () => void;
}

export function PropertyCard({ property: p, view, ownership, typeOptions, statusOptions, dealTypeOptions, publicationChannelOptions, onOwnershipChange, onEdit, onDelete, onChessGrid }: Props) {
  const { t } = useTranslation();
  const typeLbl = typeOptions.find((pt) => pt.value === p?.type)?.label || t(`const.propertyType.${p?.type}`) || p?.type;
  const st = statusOptions.find((s) => s.value === p?.status);
  const statusColor = st?.color ?? '#72BF78';
  const getDealTypeLabel = (value: string) => dealTypeOptions.find((item) => item.value === value)?.label || value;
  const publicationLabels = (p?.publications ?? []).map((publication) => publicationChannelOptions.find((item) => item.value === publication.channel)?.label || publication.channel);
  const publicationPreview = publicationLabels.slice(0, 2);
  const hiddenPublicationCount = Math.max(0, publicationLabels.length - publicationPreview.length);
  const ownershipBadgeClass = ownership === 'my'
    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30';
  const ownershipLabel = ownership === 'my' ? t('properties.segment.my') : t('properties.segment.potential');

  if (view === 'list') {
    return (
      <div className="group/card bg-card rounded-2xl border border-border/60 dark:border-border/40 p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-4">
          {p?.photos?.[0]?.url ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img src={p.photos[0].url} alt={p?.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#073B34]/10 to-emerald-800/10 dark:from-[#073B34]/20 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-[#073B34] dark:text-emerald-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{p?.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{p?.address}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            {p?.area && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.area} м²</span>}
            {p?.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.rooms}</span>}
            {p?.dealTypes?.length ? <span>{p.dealTypes.map(getDealTypeLabel).join(', ')}</span> : null}
            {publicationPreview.length ? (
              <span className="flex items-center gap-1.5 max-w-[220px] truncate">
                <RadioTower className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {publicationPreview.join(', ')}
                  {hiddenPublicationCount ? ` +${hiddenPublicationCount}` : ''}
                </span>
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-primary">{formatPrice(p?.price, p?.currency ?? undefined)}</span>
            {p?.priceHistory?.length ? <PriceHistoryBadge items={p.priceHistory} t={t} /> : null}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold transition-opacity hover:opacity-85', ownershipBadgeClass)}
              >
                {ownershipLabel}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem onSelect={() => onOwnershipChange('my')}>
                {t('properties.segment.my')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onOwnershipChange('potential')}>
                {t('properties.segment.potential')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <PropertyStatusBadge status={p?.status} t={t} options={statusOptions} />
          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {onChessGrid && <button onClick={onChessGrid} className="p-2 rounded-xl hover:bg-[#073B34]/10 transition"><Grid3X3 className="w-4 h-4 text-[#073B34] dark:text-emerald-400" /></button>}
            <button onClick={onEdit} className="p-2 rounded-xl hover:bg-muted transition"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={onDelete} className="p-2 rounded-xl hover:bg-destructive/10 transition"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/card bg-card rounded-2xl border border-border/60 dark:border-border/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={onEdit}>
      {/* Image / Placeholder */}
      <div className="relative h-40 overflow-hidden">
        {p?.photos?.[0]?.url ? (
          <img src={p.photos[0].url} alt={p?.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-[#073B34]/30 dark:to-emerald-900/20 flex items-center justify-center">
            <Building className="w-14 h-14 text-emerald-300 dark:text-emerald-600" />
          </div>
        )}
        {/* Status pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md" style={{ backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}30` }}>
            {t(`const.propertyStatus.${p?.status}`) || st?.label || p?.status}
          </span>
        </div>
        <div className="absolute top-12 left-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition-opacity hover:opacity-85', ownershipBadgeClass)}
              >
                {ownershipLabel}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem onSelect={() => onOwnershipChange('my')}>
                {t('properties.segment.my')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onOwnershipChange('potential')}>
                {t('properties.segment.potential')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <PropertyTypeBadge type={p?.type} t={t} options={typeOptions} />
        </div>
        {/* Hover actions */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-200" onClick={e => e.stopPropagation()}>
          {onChessGrid && (
            <button onClick={onChessGrid} className="w-8 h-8 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition shadow-sm">
              <Grid3X3 className="w-4 h-4 text-[#073B34] dark:text-emerald-400" />
            </button>
          )}
          <button onClick={onEdit} className="w-8 h-8 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition shadow-sm">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition shadow-sm">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 truncate">{p?.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{p?.address}</span></p>
        {/* Stats row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          {p?.area && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 dark:bg-muted/30">
              <Maximize className="w-3 h-3" />{p.area} м²
            </span>
          )}
          {p?.rooms != null && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 dark:bg-muted/30">
              <BedDouble className="w-3 h-3" />{p.rooms}
            </span>
          )}
          {p?.floor && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 dark:bg-muted/30">
              <Layers className="w-3 h-3" />{p.floor}{p.totalFloors ? `/${p.totalFloors}` : ''}
            </span>
          )}
        </div>
        {p?.dealTypes?.length ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {p.dealTypes.map((dealType) => (
              <span key={dealType} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary">
                {getDealTypeLabel(dealType)}
              </span>
            ))}
          </div>
        ) : null}
        {publicationPreview.length ? (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground mr-1">
              <RadioTower className="w-3 h-3" />
              {t('properties.publications.shortLabel')}
            </span>
            {publicationPreview.map((label) => (
              <span key={label} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-muted/60 text-foreground/80">
                {label}
              </span>
            ))}
            {hiddenPublicationCount ? (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground">
                +{hiddenPublicationCount}
              </span>
            ) : null}
          </div>
        ) : null}
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-primary">{formatPrice(p?.price, p?.currency ?? undefined)}</span>
            {p?.priceHistory?.length ? <PriceHistoryBadge items={p.priceHistory} t={t} /> : null}
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover/card:text-primary group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
