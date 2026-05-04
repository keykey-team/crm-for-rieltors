'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Grid3X3, Home, DollarSign, Ruler, Layers, ChevronLeft, ChevronRight, Trash2, Edit2, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/context';

/* ─── Room type colors (Flatris-style: each room count has unique color) ─── */
const ROOM_COLORS: Record<number, { bg: string; text: string; solid: string }> = {
  0: { bg: 'bg-violet-400', text: 'text-white', solid: '#8B5CF6' },
  1: { bg: 'bg-sky-400', text: 'text-white', solid: '#38BDF8' },
  2: { bg: 'bg-emerald-400', text: 'text-white', solid: '#34D399' },
  3: { bg: 'bg-amber-400', text: 'text-white', solid: '#FBBF24' },
  4: { bg: 'bg-rose-400', text: 'text-white', solid: '#FB7185' },
  5: { bg: 'bg-teal-400', text: 'text-white', solid: '#2DD4BF' },
};

const getRoomColor = (rooms: number | null) => {
  const r = rooms ?? 1;
  return ROOM_COLORS[Math.min(r, 5)] || ROOM_COLORS[1];
};

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  section: number;
  rooms: number | null;
  area: number | null;
  price: number | null;
  status: string;
  dealId: string | null;
}

interface Props {
  propertyId: string;
  propertyTitle?: string;
  totalFloors?: number;
  onClose: () => void;
}

export function ChessGrid({ propertyId, propertyTitle, totalFloors = 10, onClose }: Props) {
  const { t } = useTranslation();

  const UNIT_STATUSES = useMemo(() => [
    { value: 'available', label: t('chess.unitStatus.available'), color: '#22C55E', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', ring: 'ring-emerald-500' },
    { value: 'reserved', label: t('chess.unitStatus.reserved'), color: '#F59E0B', bg: 'bg-amber-500', bgLight: 'bg-amber-50', ring: 'ring-amber-500' },
    { value: 'sold', label: t('chess.unitStatus.sold'), color: '#EF4444', bg: 'bg-red-500', bgLight: 'bg-red-50', ring: 'ring-red-500' },
    { value: 'unavailable', label: t('chess.unitStatus.unavailable'), color: '#9CA3AF', bg: 'bg-gray-400', bgLight: 'bg-gray-50', ring: 'ring-gray-400' },
  ], [t]);

  const ROOM_LABELS: Record<number, string> = useMemo(() => ({
    0: t('chess.roomLabel.0'), 1: t('chess.roomLabel.1'), 2: t('chess.roomLabel.2'),
    3: t('chess.roomLabel.3'), 4: t('chess.roomLabel.4'), 5: t('chess.roomLabel.5'),
  }), [t]);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roomsFilter, setRoomsFilter] = useState<number | ''>('');

  const [bulkSections, setBulkSections] = useState(1);
  const [bulkFloorFrom, setBulkFloorFrom] = useState(1);
  const [bulkFloorTo, setBulkFloorTo] = useState(10);
  const [bulkUnitsPerFloor, setBulkUnitsPerFloor] = useState(4);
  const [bulkRooms, setBulkRooms] = useState(1);
  const [bulkArea, setBulkArea] = useState(0);
  const [bulkPrice, setBulkPrice] = useState(0);

  const [newUnit, setNewUnit] = useState({ unitNumber: '', floor: 1, section: 1, rooms: 1, area: 0, price: 0 });

  const fetchUnits = useCallback(async () => {
    const res = await fetch(`/api/property-units?propertyId=${propertyId}`);
    const data = await res.json();
    setUnits(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [propertyId]);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const filteredUnits = useMemo(() => {
    let result = units;
    if (statusFilter) result = result.filter(u => u.status === statusFilter);
    if (roomsFilter !== '') result = result.filter(u => (u.rooms ?? 1) === roomsFilter);
    return result;
  }, [units, statusFilter, roomsFilter]);

  const sections = useMemo(() => Array.from(new Set(units.map(u => u.section))).sort((a, b) => a - b), [units]);
  const floors = useMemo(() => {
    const floorSet = new Set(units.map(u => u.floor));
    return Array.from(floorSet).sort((a, b) => b - a);
  }, [units]);

  const stats = useMemo(() => {
    const total = units.length;
    const available = units.filter(u => u.status === 'available').length;
    const reserved = units.filter(u => u.status === 'reserved').length;
    const sold = units.filter(u => u.status === 'sold').length;
    const minPrice = units.filter(u => u.price && u.status === 'available').reduce((min, u) => u.price! < min ? u.price! : min, Infinity);
    const maxPrice = units.filter(u => u.price && u.status === 'available').reduce((max, u) => u.price! > max ? u.price! : max, 0);
    const minArea = units.filter(u => u.area).reduce((min, u) => u.area! < min ? u.area! : min, Infinity);
    const maxArea = units.filter(u => u.area).reduce((max, u) => u.area! > max ? u.area! : max, 0);
    return { total, available, reserved, sold, minPrice: minPrice === Infinity ? 0 : minPrice, maxPrice, minArea: minArea === Infinity ? 0 : minArea, maxArea };
  }, [units]);

  const addUnit = async () => {
    if (!newUnit.unitNumber) { toast.error(t('chess.enterNumber')); return; }
    const res = await fetch('/api/property-units', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newUnit, propertyId, area: newUnit.area || null, price: newUnit.price || null }),
    });
    if (!res.ok) { toast.error(t('common.addError')); return; }
    setNewUnit({ unitNumber: '', floor: 1, section: 1, rooms: 1, area: 0, price: 0 });
    setShowAdd(false); fetchUnits(); toast.success(t('chess.unitAdded'));
  };

  const bulkAdd = async () => {
    const toCreate: any[] = [];
    for (let s = 1; s <= bulkSections; s++) {
      for (let f = bulkFloorFrom; f <= bulkFloorTo; f++) {
        for (let u = 1; u <= bulkUnitsPerFloor; u++) {
          const num = `${s}${String(f).padStart(2, '0')}${String(u).padStart(2, '0')}`;
          toCreate.push({ unitNumber: num, floor: f, section: s, rooms: bulkRooms, area: bulkArea || null, price: bulkPrice || null, propertyId });
        }
      }
    }
    let ok = 0;
    for (const item of toCreate) {
      const res = await fetch('/api/property-units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (res.ok) ok++;
    }
    toast.success(`${t('chess.addedN')} ${ok} ${t('chess.unitsCount')}`);
    setShowBulkAdd(false); fetchUnits();
  };

  const updateStatus = async (unitId: string, status: string) => {
    await fetch('/api/property-units', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: unitId, status }) });
    fetchUnits();
    if (selectedUnit?.id === unitId) setSelectedUnit(prev => prev ? { ...prev, status } : null);
  };

  const updateUnit = async (unitId: string, data: Partial<Unit>) => {
    await fetch('/api/property-units', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: unitId, ...data }) });
    fetchUnits(); setEditingUnit(null);
    if (selectedUnit?.id === unitId) setSelectedUnit(prev => prev ? { ...prev, ...data } : null);
    toast.success(t('common.updated'));
  };

  const deleteUnit = async (unitId: string) => {
    if (!confirm(t('chess.deleteConfirm'))) return;
    await fetch(`/api/property-units?id=${unitId}`, { method: 'DELETE' });
    if (selectedUnit?.id === unitId) setSelectedUnit(null);
    fetchUnits(); toast.success(t('common.deleted'));
  };

  const getUnitsForCell = (section: number, floor: number) => {
    return filteredUnits.filter(u => u.section === section && u.floor === floor);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex" onClick={onClose}>
      <div className="flex w-full h-full" onClick={e => e.stopPropagation()}>

        {/* ═══════ LEFT PANEL: Filters & Stats ═══════ */}
        <div className="w-64 bg-white border-r border-border flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <Grid3X3 className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-base truncate">{propertyTitle || t('chess.title')}</h2>
            </div>
            <p className="text-xs text-muted-foreground">{t('chess.found')}: {filteredUnits.length} {t('chess.units')}</p>
          </div>

          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('chess.roominess')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(ROOM_LABELS).map(([r, label]) => {
                const rc = getRoomColor(+r);
                const isActive = roomsFilter === +r;
                return (
                  <button key={r} type="button"
                    onClick={() => setRoomsFilter(isActive ? '' : +r)}
                    className={cn('flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isActive ? 'ring-2 ring-offset-1 shadow-sm' : 'opacity-70 hover:opacity-100')}
                    style={{ backgroundColor: rc.solid + (isActive ? '' : '30'), color: isActive ? '#fff' : rc.solid,
                      ...(isActive ? { ringColor: rc.solid } : {}) }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('common.status')}</p>
            <div className="space-y-1.5">
              {UNIT_STATUSES.map(s => {
                const count = units.filter(u => u.status === s.value).length;
                const isActive = statusFilter === s.value;
                return (
                  <button key={s.value} type="button" onClick={() => setStatusFilter(isActive ? '' : s.value)}
                    className={cn('flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition',
                      isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50')}>
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 text-left">{s.label}</span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-gray-100 text-muted-foreground')}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-b border-border space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('chess.stats')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-emerald-600">{stats.available}</p>
                <p className="text-[10px] text-emerald-600/70">{t('chess.available')}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-amber-600">{stats.reserved}</p>
                <p className="text-[10px] text-amber-600/70">{t('chess.reserved')}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-red-500">{stats.sold}</p>
                <p className="text-[10px] text-red-500/70">{t('chess.sold')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-gray-600">{stats.total}</p>
                <p className="text-[10px] text-gray-500">{t('chess.total')}</p>
              </div>
            </div>
            {stats.minPrice > 0 && (
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between"><span>{t('chess.priceFrom')}</span><span className="font-medium text-foreground">{formatPrice(stats.minPrice)}</span></div>
                <div className="flex justify-between mt-0.5"><span>{t('chess.priceTo')}</span><span className="font-medium text-foreground">{formatPrice(stats.maxPrice)}</span></div>
              </div>
            )}
            {stats.minArea > 0 && (
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between"><span>{t('chess.areaFrom')}</span><span className="font-medium text-foreground">{stats.minArea} {t('chess.pricePerM2')}</span></div>
                <div className="flex justify-between mt-0.5"><span>{t('chess.areaTo')}</span><span className="font-medium text-foreground">{stats.maxArea} {t('chess.pricePerM2')}</span></div>
              </div>
            )}
          </div>

          <div className="p-4 mt-auto space-y-2">
            <button type="button" onClick={() => { setShowAdd(true); setShowBulkAdd(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              <Plus className="w-4 h-4" /> {t('chess.addUnit')}
            </button>
            <button type="button" onClick={() => { setShowBulkAdd(true); setShowAdd(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition">
              <Layers className="w-4 h-4" /> {t('chess.bulkFill')}
            </button>
          </div>
        </div>

        {/* ═══════ CENTER: Chess Grid ═══════ */}
        <div className="flex-1 flex flex-col bg-gray-50/80 overflow-hidden">
          <div className="h-14 bg-white border-b border-border flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                {UNIT_STATUSES.map(s => (
                  <div key={s.value} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                ))}
                <div className="w-px h-4 bg-border mx-1" />
                {Object.entries(ROOM_LABELS).map(([r, label]) => (
                  <div key={r} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getRoomColor(+r).solid }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="animate-pulse text-center">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('chess.loading')}</p>
                </div>
              </div>
            ) : units.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="text-lg font-semibold mb-2">{t('chess.empty')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('chess.emptyHint')}</p>
                  <button type="button" onClick={() => setShowBulkAdd(true)}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
                    <Layers className="w-4 h-4 inline mr-2" />{t('chess.bulkFill')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 min-w-fit">
                {sections.map(section => (
                  <div key={section} className="shrink-0">
                    <div className="text-center mb-3">
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                        {t('chess.sectionLabel')} {section}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {floors.map(floor => {
                        const cellUnits = getUnitsForCell(section, floor);
                        if (cellUnits.length === 0 && filteredUnits.filter(u => u.section === section).length > 0) {
                          const allFloorUnits = units.filter(u => u.section === section && u.floor === floor);
                          if (allFloorUnits.length === 0) return null;
                          return (
                            <div key={floor} className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono text-muted-foreground w-7 text-right shrink-0">{floor}</span>
                              <div className="flex gap-1">
                                {allFloorUnits.map(u => (
                                  <div key={u.id} className="w-12 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-200" />
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (cellUnits.length === 0) return null;
                        return (
                          <div key={floor} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-muted-foreground w-7 text-right shrink-0">{floor}</span>
                            <div className="flex gap-1">
                              {cellUnits.map(unit => {
                                const st = UNIT_STATUSES.find(s => s.value === unit.status) || UNIT_STATUSES[0];
                                const rc = getRoomColor(unit.rooms);
                                const isSelected = selectedUnit?.id === unit.id;
                                const isSold = unit.status === 'sold';
                                const isReserved = unit.status === 'reserved';
                                const isUnavail = unit.status === 'unavailable';
                                const dimmed = isSold || isUnavail;
                                return (
                                  <button key={unit.id} type="button"
                                    onClick={() => setSelectedUnit(unit)}
                                    className={cn(
                                      'relative w-12 h-12 rounded-lg flex flex-col items-center justify-center text-[11px] font-bold transition-all duration-150',
                                      'hover:scale-110 hover:z-10 hover:shadow-lg cursor-pointer',
                                      isSelected && 'ring-2 ring-primary ring-offset-2 scale-110 z-10 shadow-lg',
                                      dimmed && 'opacity-50',
                                    )}
                                    style={{ backgroundColor: rc.solid, color: '#fff' }}
                                    aria-label={`${t('chess.unitLabel')} ${unit.unitNumber}`}
                                  >
                                    <span className="leading-none">{unit.unitNumber}</span>
                                    <span className="text-[9px] opacity-80 leading-none mt-0.5">
                                      {unit.rooms != null ? ROOM_LABELS[Math.min(unit.rooms, 5)] : ''}
                                    </span>
                                    {(isReserved || isSold || isUnavail) && (
                                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                                        style={{ backgroundColor: st.color }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Add unit modal ─── */}
          {showAdd && (
            <div className="absolute inset-0 bg-black/20 z-30 flex items-center justify-center" onClick={() => setShowAdd(false)}>
              <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold">{t('chess.addUnit')}</h3>
                  <button type="button" onClick={() => setShowAdd(false)} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.number')} *</label>
                    <input value={newUnit.unitNumber} onChange={e => setNewUnit({...newUnit, unitNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" placeholder="101" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.floor')}</label>
                    <input type="number" value={newUnit.floor || ''} onChange={e => setNewUnit({...newUnit, floor: +e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.section')}</label>
                    <input type="number" value={newUnit.section || ''} onChange={e => setNewUnit({...newUnit, section: +e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.rooms')}</label>
                    <select value={newUnit.rooms} onChange={e => setNewUnit({...newUnit, rooms: +e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1">
                      {Object.entries(ROOM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.area')} ({t('chess.pricePerM2')})</label>
                    <input type="number" value={newUnit.area || ''} onChange={e => setNewUnit({...newUnit, area: +e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.price')} ($)</label>
                    <input type="number" value={newUnit.price || ''} onChange={e => setNewUnit({...newUnit, price: +e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                </div>
                <button type="button" onClick={addUnit} className="w-full mt-4 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
                  {t('common.add')}
                </button>
              </div>
            </div>
          )}

          {/* ─── Bulk add modal ─── */}
          {showBulkAdd && (
            <div className="absolute inset-0 bg-black/20 z-30 flex items-center justify-center" onClick={() => setShowBulkAdd(false)}>
              <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold">{t('chess.bulkTitle')}</h3>
                  <button type="button" onClick={() => setShowBulkAdd(false)} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('chess.sectionsCount')}</label>
                    <input type="number" min={1} value={bulkSections} onChange={e => setBulkSections(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('chess.unitsPerFloor')}</label>
                    <input type="number" min={1} value={bulkUnitsPerFloor} onChange={e => setBulkUnitsPerFloor(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('chess.floorFrom')}</label>
                    <input type="number" min={1} value={bulkFloorFrom} onChange={e => setBulkFloorFrom(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('chess.floorTo')}</label>
                    <input type="number" min={1} value={bulkFloorTo} onChange={e => setBulkFloorTo(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('chess.defaultRooms')}</label>
                    <select value={bulkRooms} onChange={e => setBulkRooms(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1">
                      {Object.entries(ROOM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('common.area')} ({t('chess.pricePerM2')})</label>
                    <input type="number" value={bulkArea || ''} onChange={e => setBulkArea(+e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm mt-1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {t('chess.willCreate')}: <b>{bulkSections * (bulkFloorTo - bulkFloorFrom + 1) * bulkUnitsPerFloor}</b> {t('chess.unitsCount')}
                </p>
                <button type="button" onClick={bulkAdd} className="w-full mt-3 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
                  {t('common.create')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══════ RIGHT PANEL: Unit Details ═══════ */}
        <div className={cn(
          'w-80 bg-white border-l border-border flex flex-col shrink-0 transition-all overflow-y-auto',
          !selectedUnit && 'w-0 border-l-0'
        )}>
          {selectedUnit && (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('chess.apartment')}</p>
                    <h3 className="text-xl font-display font-bold">№ {selectedUnit.unitNumber}</h3>
                  </div>
                  <button type="button" onClick={() => setSelectedUnit(null)} className="p-1.5 hover:bg-muted rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-border">
                {selectedUnit.price ? (
                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{formatPrice(selectedUnit.price)}</p>
                    {selectedUnit.area ? (
                      <p className="text-xs text-muted-foreground mt-1">{formatPrice(Math.round(selectedUnit.price / selectedUnit.area))}/{t('chess.pricePerM2')}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-muted-foreground text-sm">{t('common.priceNotSet')}</div>
                )}
              </div>

              <div className="p-4 border-b border-border">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    <tr><td className="py-2 text-muted-foreground">{t('common.floor')}</td><td className="py-2 text-right font-medium">{selectedUnit.floor}</td></tr>
                    <tr><td className="py-2 text-muted-foreground">{t('common.section')}</td><td className="py-2 text-right font-medium">{selectedUnit.section}</td></tr>
                    <tr><td className="py-2 text-muted-foreground">{t('common.rooms')}</td><td className="py-2 text-right font-medium">{selectedUnit.rooms != null ? ROOM_LABELS[Math.min(selectedUnit.rooms, 5)] || selectedUnit.rooms : '—'}</td></tr>
                    <tr><td className="py-2 text-muted-foreground">{t('common.area')}</td><td className="py-2 text-right font-medium">{selectedUnit.area ? `${selectedUnit.area} ${t('chess.pricePerM2')}` : '—'}</td></tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">{t('common.status')}</td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: (UNIT_STATUSES.find(s => s.value === selectedUnit.status)?.color || '#999') + '20',
                            color: UNIT_STATUSES.find(s => s.value === selectedUnit.status)?.color || '#999' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: UNIT_STATUSES.find(s => s.value === selectedUnit.status)?.color }} />
                          {UNIT_STATUSES.find(s => s.value === selectedUnit.status)?.label || selectedUnit.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('chess.changeStatus')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {UNIT_STATUSES.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => updateStatus(selectedUnit.id, s.value)}
                      className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition',
                        selectedUnit.status === s.value ? 'ring-2 ring-offset-1' : 'hover:bg-gray-50')}
                      style={{
                        backgroundColor: selectedUnit.status === s.value ? s.color + '20' : undefined,
                        color: s.color,
                        ...(selectedUnit.status === s.value ? { '--tw-ring-color': s.color } as any : {})
                      }}>
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 mt-auto space-y-2">
                <button type="button" onClick={() => deleteUnit(selectedUnit.id)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" /> {t('chess.deleteUnit')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
