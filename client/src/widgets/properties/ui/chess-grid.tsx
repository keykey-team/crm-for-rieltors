'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Grid3X3, Home, DollarSign, Ruler, Layers, ChevronLeft, ChevronRight, Trash2, Edit2, Check, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { getPropertyUnits, createPropertyUnit, updatePropertyUnit, deletePropertyUnit } from '@/entities/property-unit';
import { formatPrice } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';
import { confirmAction } from '@/shared/lib/confirm-action';
import { getRoomColor, ROOM_COLORS, STATUS_STYLES } from '@/widgets/properties/model/chess-grid-utils';

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
    { value: 'available', label: t('chess.unitStatus.available') },
    { value: 'reserved', label: t('chess.unitStatus.reserved') },
    { value: 'sold', label: t('chess.unitStatus.sold') },
    { value: 'unavailable', label: t('chess.unitStatus.unavailable') },
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roomsFilter, setRoomsFilter] = useState<number | ''>('');

  const [editingUnit, setEditingUnit] = useState(false);
  const [editValues, setEditValues] = useState({ unitNumber: '', floor: 1, section: 1, rooms: 1, area: '', price: '' });
  const [editSaving, setEditSaving] = useState(false);

  const [sectionEditOpen, setSectionEditOpen] = useState<number | null>(null);
  const [sectionEditRooms, setSectionEditRooms] = useState('');
  const [sectionEditArea, setSectionEditArea] = useState('');
  const [sectionEditPrice, setSectionEditPrice] = useState('');
  const [sectionEditSaving, setSectionEditSaving] = useState(false);

  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSections, setBulkSections] = useState(1);
  const [bulkFloorFrom, setBulkFloorFrom] = useState(1);
  const [bulkFloorTo, setBulkFloorTo] = useState(10);
  const [bulkUnitsPerFloor, setBulkUnitsPerFloor] = useState(4);
  const [bulkRooms, setBulkRooms] = useState(1);
  const [bulkArea, setBulkArea] = useState(0);
  const [bulkPrice, setBulkPrice] = useState(0);

  const [newUnit, setNewUnit] = useState({ unitNumber: '', floor: 1, section: 1, rooms: 1, area: 0, price: 0 });

  const fetchUnits = useCallback(async () => {
    const data = await getPropertyUnits(propertyId);
    setUnits((data as any[]).map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      floor: Number(u.floor ?? 0),
      section: Number(u.section ?? 1),
      rooms: u.rooms ?? null,
      area: u.area ?? null,
      price: u.price ?? null,
      status: u.status ?? 'available',
      dealId: u.dealId ?? null,
    })));
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
    return { total, available, reserved, sold, minPrice: minPrice === Infinity ? 0 : minPrice, maxPrice };
  }, [units]);

  const addUnit = async () => {
    if (!newUnit.unitNumber) { toast.error(t('chess.enterNumber')); return; }
    try {
      await createPropertyUnit({ ...newUnit, propertyId, area: newUnit.area || null, price: newUnit.price || null });
    } catch (err) { toast.error(err instanceof Error ? err.message : t('common.addError')); return; }
    setNewUnit({ unitNumber: '', floor: 1, section: 1, rooms: 1, area: 0, price: 0 });
    setShowAdd(false); fetchUnits(); toast.success(t('chess.unitAdded'));
  };

  const bulkAdd = async () => {
    if (bulkSaving) return;
    setBulkSaving(true);
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
    let skipped = 0;
    for (const item of toCreate) {
      try {
        await createPropertyUnit(item);
        ok++;
      } catch (err) {
        if (err instanceof Error && err.message === 'Already exists') skipped++;
      }
    }
    setBulkSaving(false);
    setShowBulkAdd(false);
    fetchUnits();
    if (skipped > 0 && ok === 0) {
      toast.error(t('chess.allExist'));
    } else if (skipped > 0) {
      toast.success(`${t('chess.addedN')} ${ok} ${t('chess.unitsCount')} (${skipped} ${t('chess.skippedExist')})`);
    } else {
      toast.success(`${t('chess.addedN')} ${ok} ${t('chess.unitsCount')}`);
    }
  };

  const updateStatus = async (unitId: string, status: string) => {
    try {
      await updatePropertyUnit(unitId, { status });
      fetchUnits();
      if (selectedUnit?.id === unitId) setSelectedUnit(prev => prev ? { ...prev, status } : null);
    } catch (err) { toast.error(err instanceof Error ? err.message : t('common.error')); }
  };

  const startEditUnit = () => {
    if (!selectedUnit) return;
    setEditValues({
      unitNumber: selectedUnit.unitNumber,
      floor: selectedUnit.floor,
      section: selectedUnit.section,
      rooms: selectedUnit.rooms ?? 1,
      area: selectedUnit.area?.toString() ?? '',
      price: selectedUnit.price?.toString() ?? '',
    });
    setEditingUnit(true);
  };

  const saveUnitEdit = async () => {
    if (!selectedUnit) return;
    setEditSaving(true);
    try {
      await updatePropertyUnit(selectedUnit.id, {
        unitNumber: editValues.unitNumber,
        floor: editValues.floor,
        section: editValues.section,
        rooms: editValues.rooms,
        area: editValues.area ? Number(editValues.area) : null,
        price: editValues.price ? Number(editValues.price) : null,
      });
      setEditingUnit(false);
      fetchUnits();
      toast.success(t('deals.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setEditSaving(false);
    }
  };

  const saveSectionEdit = async () => {
    if (sectionEditOpen === null) return;
    const sectionUnits = units.filter(u => u.section === sectionEditOpen);
    const data: Record<string, unknown> = {};
    if (sectionEditRooms !== '') data.rooms = Number(sectionEditRooms);
    if (sectionEditArea !== '') data.area = Number(sectionEditArea);
    if (sectionEditPrice !== '') data.price = Number(sectionEditPrice);
    if (Object.keys(data).length === 0) { setSectionEditOpen(null); return; }
    setSectionEditSaving(true);
    let ok = 0;
    for (const unit of sectionUnits) {
      try { await updatePropertyUnit(unit.id, data); ok++; } catch { /* skip */ }
    }
    setSectionEditSaving(false);
    setSectionEditOpen(null);
    fetchUnits();
    toast.success(`${t('deals.saved')}: ${ok} ${t('chess.unitsCount')}`);
  };

  const deleteUnit = async (unitId: string) => {
    const ok = await confirmAction(t('chess.deleteConfirm'));
    if (!ok) return;
    await deletePropertyUnit(unitId);
    if (selectedUnit?.id === unitId) setSelectedUnit(null);
    fetchUnits(); toast.success(t('common.deleted'));
  };

  const getUnitsForCell = (section: number, floor: number) => {
    return filteredUnits.filter(u => u.section === section && u.floor === floor);
  };

  if (typeof document === 'undefined') return null;

  return createPortal((
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex" onClick={onClose}>
      {bulkSaving && (
        <div className="absolute inset-0 z-[80] backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-white text-sm font-medium">{t('common.saving')}…</p>
        </div>
      )}
      <div className="flex w-full h-full" onClick={e => e.stopPropagation()}>

        {/* ═══════ LEFT PANEL ═══════ */}
        <div className="w-72 bg-card border-r border-border/60 dark:border-border/40 flex flex-col shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-border/60 dark:border-border/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
                <Grid3X3 className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-sm truncate">{propertyTitle || t('chess.title')}</h2>
                <p className="text-[11px] text-muted-foreground">{filteredUnits.length} {t('chess.units')}</p>
              </div>
            </div>
          </div>

          {/* Room filter */}
          <div className="p-4 border-b border-border/60 dark:border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('chess.roominess')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(ROOM_LABELS).map(([r, label]) => {
                const rc = getRoomColor(+r);
                const isActive = roomsFilter === +r;
                return (
                  <button key={r} type="button"
                    onClick={() => setRoomsFilter(isActive ? '' : +r)}
                    className={cn(
                      'flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'text-white shadow-sm scale-[1.02]'
                        : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground hover:bg-muted'
                    )}
                    style={isActive ? { background: `linear-gradient(135deg, ${rc.solid}DD, ${rc.solid})` } : {}}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status filter */}
          <div className="p-4 border-b border-border/60 dark:border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('common.status')}</p>
            <div className="space-y-1">
              {UNIT_STATUSES.map(s => {
                const count = units.filter(u => u.status === s.value).length;
                const isActive = statusFilter === s.value;
                const ss = STATUS_STYLES[s.value] || STATUS_STYLES.available;
                return (
                  <button key={s.value} type="button" onClick={() => setStatusFilter(isActive ? '' : s.value)}
                    className={cn('flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                      isActive ? 'bg-muted font-medium' : 'hover:bg-muted/50')}>
                    <div className={cn('w-3 h-3 rounded-full shrink-0')} style={{ backgroundColor: ss.solid }} />
                    <span className="flex-1 text-left text-sm">{s.label}</span>
                    <span className={cn('text-xs tabular-nums font-medium px-2 py-0.5 rounded-full',
                      isActive ? 'bg-primary/10 text-primary' : 'bg-muted/80 dark:bg-muted text-muted-foreground')}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-border/60 dark:border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('chess.stats')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: stats.available, label: t('chess.available'), color: 'emerald' },
                { value: stats.reserved, label: t('chess.reserved'), color: 'amber' },
                { value: stats.sold, label: t('chess.sold'), color: 'red' },
                { value: stats.total, label: t('chess.total'), color: 'gray' },
              ].map((item, i) => (
                <div key={i} className={cn('rounded-xl p-3 text-center',
                  `bg-${item.color}-500/10 dark:bg-${item.color}-500/15`)}>
                  <p className={cn('text-lg font-bold tabular-nums', `text-${item.color}-600 dark:text-${item.color}-400`)}>{item.value}</p>
                  <p className={cn('text-[10px] font-medium', `text-${item.color}-600/70 dark:text-${item.color}-400/70`)}>{item.label}</p>
                </div>
              ))}
            </div>
            {stats.minPrice > 0 && (
              <div className="mt-3 p-3 bg-muted/50 dark:bg-muted/30 rounded-xl text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('chess.priceFrom')}</span><span className="font-mono font-semibold">{formatPrice(stats.minPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('chess.priceTo')}</span><span className="font-mono font-semibold">{formatPrice(stats.maxPrice)}</span></div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 mt-auto space-y-2">
            <button type="button" onClick={() => { setShowAdd(true); setShowBulkAdd(false); }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
              <Plus className="w-4 h-4" /> {t('chess.addUnit')}
            </button>
            <button type="button" onClick={() => { setShowBulkAdd(true); setShowAdd(false); }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/15 transition">
              <Layers className="w-4 h-4" /> {t('chess.bulkFill')}
            </button>
          </div>
        </div>

        {/* ═══════ CENTER: Grid ═══════ */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {/* Top bar */}
          <div className="bg-card/80 backdrop-blur-sm border-b border-border/60 dark:border-border/40 flex items-center justify-between px-5 py-3 shrink-0">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Legend */}
              {UNIT_STATUSES.map(s => {
                const ss = STATUS_STYLES[s.value] || STATUS_STYLES.available;
                return (
                  <div key={s.value} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ss.solid }} />
                    <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  </div>
                );
              })}
              <div className="w-px h-4 bg-border/60" />
              {Object.entries(ROOM_LABELS).slice(0, 4).map(([r, label]) => (
                <div key={r} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getRoomColor(+r).solid + '40' }} />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-auto p-6">
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
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#073B34]/10 to-emerald-800/10 flex items-center justify-center mx-auto mb-4">
                    <Grid3X3 className="w-10 h-10 text-[#073B34] dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{t('chess.empty')}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{t('chess.emptyHint')}</p>
                  <button type="button" onClick={() => setShowBulkAdd(true)}
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">
                    <Layers className="w-4 h-4 inline mr-2" />{t('chess.bulkFill')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-8 min-w-fit">
                {sections.map(section => (
                  <div key={section} className="shrink-0">
                    <div className="text-center mb-4 flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        <Layers className="w-3 h-3" />
                        {t('chess.sectionLabel')} {section}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSectionEditOpen(section); setSectionEditRooms(''); setSectionEditArea(''); setSectionEditPrice(''); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                        title={t('chess.editSection')}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {floors.map(floor => {
                        const cellUnits = getUnitsForCell(section, floor);
                        if (cellUnits.length === 0) {
                          const allFloorUnits = units.filter(u => u.section === section && u.floor === floor);
                          if (allFloorUnits.length === 0) return null;
                          if (filteredUnits.filter(u => u.section === section).length > 0) {
                            return (
                              <div key={floor} className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-muted-foreground/60 w-7 text-right shrink-0">{floor}</span>
                                <div className="flex gap-1.5">
                                  {allFloorUnits.map(u => (
                                    <div key={u.id} className="w-[52px] h-[52px] rounded-xl bg-muted/30 border border-dashed border-border/40" />
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }
                        return (
                          <div key={floor} className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-muted-foreground w-7 text-right shrink-0">{floor}</span>
                            <div className="flex gap-1.5">
                              {cellUnits.map(unit => {
                                const ss = STATUS_STYLES[unit.status] || STATUS_STYLES.available;
                                const rc = getRoomColor(unit.rooms);
                                const isSelected = selectedUnit?.id === unit.id;
                                const isFaded = unit.status === 'sold' || unit.status === 'unavailable';
                                return (
                                  <button key={unit.id} type="button"
                                    onClick={() => setSelectedUnit(unit)}
                                    className={cn(
                                      'relative w-[52px] h-[52px] rounded-xl flex flex-col items-center justify-center transition-all duration-200',
                                      'hover:scale-110 hover:z-10 cursor-pointer group/cell',
                                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10',
                                      isFaded && 'opacity-60',
                                    )}
                                    style={{
                                      backgroundColor: `${ss.solid}18`,
                                      border: `1.5px solid ${ss.solid}${isFaded ? '40' : '60'}`,
                                    }}
                                    aria-label={`${t('chess.unitLabel')} ${unit.unitNumber}`}
                                  >
                                    {/* Unit number */}
                                    <span className="text-[11px] font-bold leading-none text-foreground">{unit.unitNumber}</span>
                                    {/* Room badge */}
                                    <span className="text-[8px] font-bold leading-none mt-1 px-1.5 py-0.5 rounded-md"
                                      style={{ backgroundColor: rc.solid + '20', color: rc.solid }}>
                                      {unit.rooms != null ? ROOM_LABELS[Math.min(unit.rooms, 5)] : ''}
                                    </span>
                                    {/* Area */}
                                    {unit.area && (
                                      <span className="text-[7px] text-muted-foreground leading-none mt-0.5">{unit.area}м²</span>
                                    )}
                                    {/* Status dot */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background shadow-sm"
                                      style={{ backgroundColor: ss.solid }} />
                                    {/* Hover tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-popover/95 dark:bg-popover border border-border/60 rounded-xl text-[10px] whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg backdrop-blur-sm">
                                      <p className="font-semibold text-foreground">№{unit.unitNumber}</p>
                                      {unit.price && <p className="text-primary font-mono font-bold">{formatPrice(unit.price)}</p>}
                                    </div>
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-30 flex items-center justify-center" onClick={() => setShowAdd(false)}>
              <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-base">{t('chess.addUnit')}</h3>
                  <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-muted rounded-xl transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.number')} *</label>
                    <input value={newUnit.unitNumber} onChange={e => setNewUnit({...newUnit, unitNumber: e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="101" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.floor')}</label>
                    <input type="number" value={newUnit.floor || ''} onChange={e => setNewUnit({...newUnit, floor: +e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.section')}</label>
                    <input type="number" value={newUnit.section || ''} onChange={e => setNewUnit({...newUnit, section: +e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.rooms')}</label>
                    <select value={newUnit.rooms} onChange={e => setNewUnit({...newUnit, rooms: +e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {Object.entries(ROOM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.area')} ({t('chess.pricePerM2')})</label>
                    <input type="number" value={newUnit.area || ''} onChange={e => setNewUnit({...newUnit, area: +e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.price')} ($)</label>
                    <input type="number" value={newUnit.price || ''} onChange={e => setNewUnit({...newUnit, price: +e.target.value})}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <button type="button" onClick={addUnit} className="w-full mt-5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
                  {t('common.add')}
                </button>
              </div>
            </div>
          )}

          {/* ─── Bulk add modal ─── */}
          {showBulkAdd && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-30 flex items-center justify-center" onClick={() => setShowBulkAdd(false)}>
              <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-base">{t('chess.bulkTitle')}</h3>
                  <button type="button" onClick={() => setShowBulkAdd(false)} className="p-1.5 hover:bg-muted rounded-xl transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('chess.sectionsCount')}</label>
                    <input type="number" min={1} value={bulkSections} onChange={e => setBulkSections(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('chess.unitsPerFloor')}</label>
                    <input type="number" min={1} value={bulkUnitsPerFloor} onChange={e => setBulkUnitsPerFloor(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('chess.floorFrom')}</label>
                    <input type="number" min={1} value={bulkFloorFrom} onChange={e => setBulkFloorFrom(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('chess.floorTo')}</label>
                    <input type="number" min={1} value={bulkFloorTo} onChange={e => setBulkFloorTo(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('chess.defaultRooms')}</label>
                    <select value={bulkRooms} onChange={e => setBulkRooms(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {Object.entries(ROOM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('common.area')} ({t('chess.pricePerM2')})</label>
                    <input type="number" value={bulkArea || ''} onChange={e => setBulkArea(+e.target.value)}
                      className="w-full px-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">
                    {t('chess.willCreate')}: <span className="font-bold text-primary">{bulkSections * (bulkFloorTo - bulkFloorFrom + 1) * bulkUnitsPerFloor}</span> {t('chess.unitsCount')}
                  </p>
                </div>
                <button type="button" onClick={bulkAdd} disabled={bulkSaving} className="w-full mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50">
                  {bulkSaving ? t('common.saving') : t('common.create')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══════ RIGHT PANEL: Unit Details ═══════ */}
        <div className={cn(
          'bg-card border-l border-border/60 dark:border-border/40 flex flex-col shrink-0 transition-all duration-300 overflow-hidden',
          selectedUnit ? 'w-80' : 'w-0 border-l-0'
        )}>
          {selectedUnit && (() => {
            const ss = STATUS_STYLES[selectedUnit.status] || STATUS_STYLES.available;
            const unitStatus = UNIT_STATUSES.find(s => s.value === selectedUnit.status);
            return (
              <>
                {/* Header */}
                <div className="p-5 border-b border-border/60 dark:border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t('chess.apartment')}</p>
                      <h3 className="text-2xl font-display font-bold mt-0.5">№ {selectedUnit.unitNumber}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => { if (editingUnit) setEditingUnit(false); else startEditUnit(); }}
                        className={cn('p-1.5 rounded-xl transition', editingUnit ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground')}
                        title={editingUnit ? t('common.cancel') : t('common.edit')}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setSelectedUnit(null); setEditingUnit(false); }} className="p-1.5 hover:bg-muted rounded-xl transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {editingUnit ? (
                  /* ── Edit mode ── */
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('common.number')}</label>
                      <input value={editValues.unitNumber} onChange={e => setEditValues(v => ({ ...v, unitNumber: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.floor')}</label>
                        <input type="number" value={editValues.floor} onChange={e => setEditValues(v => ({ ...v, floor: +e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.section')}</label>
                        <input type="number" value={editValues.section} onChange={e => setEditValues(v => ({ ...v, section: +e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('common.rooms')}</label>
                      <select value={editValues.rooms} onChange={e => setEditValues(v => ({ ...v, rooms: +e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {Object.entries(ROOM_LABELS).map(([rv, rl]) => <option key={rv} value={rv}>{rl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('common.area')} (м²)</label>
                      <input type="number" value={editValues.area} onChange={e => setEditValues(v => ({ ...v, area: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('common.price')} ($)</label>
                      <input type="number" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setEditingUnit(false)}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted border border-border transition">
                        {t('common.cancel')}
                      </button>
                      <button type="button" onClick={saveUnitEdit} disabled={editSaving}
                        className="flex-1 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
                        {editSaving ? t('common.saving') : t('common.save')}
                      </button>
                    </div>
                    <div className="pt-1">
                      <button type="button" onClick={() => deleteUnit(selectedUnit.id)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-destructive bg-destructive/10 hover:bg-destructive/15 rounded-xl text-sm font-semibold transition">
                        <Trash2 className="w-4 h-4" /> {t('chess.deleteUnit')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <>
                    {/* Price card */}
                    <div className="p-5 border-b border-border/60 dark:border-border/40">
                      {selectedUnit.price ? (
                        <div className="bg-gradient-to-br from-primary/10 to-emerald-800/5 rounded-2xl p-5 text-center">
                          <p className="text-2xl font-bold text-primary font-mono">{formatPrice(selectedUnit.price)}</p>
                          {selectedUnit.area ? (
                            <p className="text-xs text-muted-foreground mt-1">{formatPrice(Math.round(selectedUnit.price / selectedUnit.area))}/{t('chess.pricePerM2')}</p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="bg-muted/50 dark:bg-muted/30 rounded-2xl p-5 text-center text-muted-foreground text-sm">{t('common.priceNotSet')}</div>
                      )}
                    </div>

                    {/* Properties */}
                    <div className="p-5 border-b border-border/60 dark:border-border/40">
                      <div className="space-y-3">
                        {[
                          { label: t('common.floor'), value: selectedUnit.floor },
                          { label: t('common.section'), value: selectedUnit.section },
                          { label: t('common.rooms'), value: selectedUnit.rooms != null ? ROOM_LABELS[Math.min(selectedUnit.rooms, 5)] || selectedUnit.rooms : '—' },
                          { label: t('common.area'), value: selectedUnit.area ? `${selectedUnit.area} ${t('chess.pricePerM2')}` : '—' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{row.label}</span>
                            <span className="text-sm font-semibold">{row.value}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('common.status')}</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: ss.solid + '15', color: ss.solid }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.solid }} />
                            {unitStatus?.label || selectedUnit.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status change */}
                    <div className="p-5 border-b border-border/60 dark:border-border/40">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('chess.changeStatus')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {UNIT_STATUSES.map(s => {
                          const sSS = STATUS_STYLES[s.value] || STATUS_STYLES.available;
                          const isActive = selectedUnit.status === s.value;
                          return (
                            <button key={s.value} type="button"
                              onClick={() => updateStatus(selectedUnit.id, s.value)}
                              className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                                isActive ? 'ring-2 ring-offset-2 ring-offset-background text-white shadow-sm' : 'bg-muted/50 dark:bg-muted/30 hover:bg-muted')}
                              style={isActive ? { backgroundColor: sSS.solid, ['--tw-ring-color' as any]: sSS.solid } : { color: sSS.solid }}>
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isActive ? '#fff' : sSS.solid }} />
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="p-5 mt-auto">
                      <button type="button" onClick={() => deleteUnit(selectedUnit.id)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-destructive bg-destructive/10 hover:bg-destructive/15 rounded-xl text-sm font-semibold transition">
                        <Trash2 className="w-4 h-4" /> {t('chess.deleteUnit')}
                      </button>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
      {/* ═══════ Section edit modal ═══════ */}
      {sectionEditOpen !== null && (
        <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setSectionEditOpen(null)}>
          <div className="bg-card rounded-2xl border border-border/60 p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-base">{t('chess.sectionLabel')} {sectionEditOpen} — {t('chess.editSection')}</h3>
              <button type="button" onClick={() => setSectionEditOpen(null)} className="p-1.5 hover:bg-muted rounded-xl transition"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{t('chess.sectionEditHint')}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('common.rooms')}</label>
                <select value={sectionEditRooms} onChange={e => setSectionEditRooms(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">{t('chess.noChange')}</option>
                  {Object.entries(ROOM_LABELS).map(([rv, rl]) => <option key={rv} value={rv}>{rl}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('common.area')} (м²)</label>
                <input type="number" placeholder={t('chess.noChange')} value={sectionEditArea} onChange={e => setSectionEditArea(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('common.price')} ($)</label>
                <input type="number" placeholder={t('chess.noChange')} value={sectionEditPrice} onChange={e => setSectionEditPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setSectionEditOpen(null)}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted border border-border transition">
                {t('common.cancel')}
              </button>
              <button type="button" onClick={saveSectionEdit} disabled={sectionEditSaving}
                className="flex-1 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
                {sectionEditSaving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ), document.body);
}
