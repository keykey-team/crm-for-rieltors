'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Building, MapPin, Maximize, Layers, Edit2, Trash2, Grid3X3 } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '@/shared/lib/constants';

interface Props {
  property: any;
  view: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onChessGrid?: () => void;
}

export function PropertyCard({ property: p, view, onEdit, onDelete, onChessGrid }: Props) {
  const { t } = useTranslation();
  const typeLbl = t(`const.propertyType.${p?.type}`) || PROPERTY_TYPES.find((pt: any) => pt.value === p?.type)?.label || p?.type;
  const st = PROPERTY_STATUSES.find((s: any) => s.value === p?.status);

  if (view === 'list') {
    return (
      <div className="bg-white rounded-xl p-4 flex items-center justify-between hover:scale-[1.005] transition" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <Building className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="font-medium">{p?.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p?.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-primary">{formatPrice(p?.price, p?.currency)}</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${st?.color ?? '#72BF78'}20`, color: st?.color ?? '#72BF78' }}>{t(`const.propertyStatus.${p?.status}`) || st?.label || p?.status}</span>
          {onChessGrid && <button onClick={onChessGrid} className="p-2 rounded-lg hover:bg-violet-50" title="Шахматка"><Grid3X3 className="w-4 h-4 text-violet-500" /></button>}
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:scale-[1.01] transition" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="h-36 bg-gradient-to-br from-violet-100 to-blue-50 flex items-center justify-center relative">
        <Building className="w-12 h-12 text-violet-300" />
        <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${st?.color ?? '#72BF78'}20`, color: st?.color ?? '#72BF78' }}>{t(`const.propertyStatus.${p?.status}`) || st?.label || p?.status}</span>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm mb-1">{p?.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{p?.address}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{typeLbl}</span>
          {p?.area && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{p.area} м²</span>}
          {p?.rooms && <span>{p.rooms} кім.</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-primary">{formatPrice(p?.price, p?.currency)}</span>
          <div className="flex gap-1">
            {onChessGrid && <button onClick={onChessGrid} className="p-2 rounded-lg hover:bg-violet-50" title="Шахматка"><Grid3X3 className="w-3.5 h-3.5 text-violet-500" /></button>}
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
            <button onClick={onDelete} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
