'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building, LayoutGrid, List } from 'lucide-react';
import { PropertyCard } from './property-card';
import { PropertyDialog } from './property-dialog';
import { ChessGrid } from './chess-grid';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

export function PropertiesClient() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProp, setEditProp] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [chessGridPropId, setChessGridPropId] = useState<string | null>(null);
  const [chessGridFloors, setChessGridFloors] = useState<number>(10);
  const [chessGridTitle, setChessGridTitle] = useState<string>('');

  const fetchProps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/properties?${params.toString()}`);
    const data = await res.json();
    setProperties(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  const handleSave = async (data: any) => {
    if (editProp) {
      await fetch(`/api/properties/${editProp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
      await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    setDialogOpen(false); setEditProp(null); fetchProps();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('properties.deleteProperty'))) return;
    await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    fetchProps();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" /> {t('properties.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('properties.subtitle')}</p>
        </div>
        <button onClick={() => { setEditProp(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t('properties.addProperty')}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t('properties.searchPlaceholder')} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
          <option value="">{t('common.allTypes')}</option>
          {PROPERTY_TYPES.map((tp: any) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
          <option value="">{t('common.allStatuses')}</option>
          {PROPERTY_STATUSES.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="flex bg-white rounded-xl border border-border">
          <button onClick={() => setView('grid')} className={cn('p-2.5 rounded-l-xl', view === 'grid' && 'bg-primary/10 text-primary')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-2.5 rounded-r-xl', view === 'list' && 'bg-primary/10 text-primary')}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (properties?.length ?? 0) === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('properties.noProperties')}</div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {(properties ?? []).map((p: any) => (
            <PropertyCard key={p?.id} property={p} view={view}
              onEdit={() => { setEditProp(p); setDialogOpen(true); }}
              onDelete={() => handleDelete(p?.id)}
              onChessGrid={() => { setChessGridPropId(p?.id); setChessGridFloors(p?.totalFloors || 10); setChessGridTitle(p?.title || ''); }} />
          ))}
        </div>
      )}
      {dialogOpen && <PropertyDialog property={editProp} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditProp(null); }} />}
      {chessGridPropId && <ChessGrid propertyId={chessGridPropId} propertyTitle={chessGridTitle} totalFloors={chessGridFloors} onClose={() => setChessGridPropId(null)} />}
    </div>
  );
}
