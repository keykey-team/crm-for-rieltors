'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Plus, Search, LayoutGrid, List, Upload, Trash2, UserCheck, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/lib/constants';
import { LeadTable } from './lead-table';
import { LeadDialog } from './lead-dialog';
import { LeadKanban } from './lead-kanban';
import { toast } from 'sonner';
import { confirmAction } from '@/lib/confirm-action';
import { useTranslation } from '@/lib/i18n/context';
import { HintTooltip } from '@/components/hint-tooltip';

export function LeadsClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [managers, setManagers] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [importing, setImporting] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'status' | 'assign' | null>(null);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setManagers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === '1') { setEditing(null); setShowDialog(true); }
  }, [searchParams]);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (managerFilter) params.set('managerId', managerFilter);
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, statusFilter, sourceFilter, managerFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const onSave = async (data: any) => {
    const url = editing ? `/api/leads/${editing.id}` : '/api/leads';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { toast.success(editing ? t('common.updated') : t('common.created')); setShowDialog(false); setEditing(null); fetchLeads(); }
    else toast.error(t('common.error'));
  };

  const onDelete = async (id: string) => {
    const ok = await confirmAction(t('leads.deleteLead'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    toast.success(t('common.deleted')); fetchLeads();
  };

  const onStatusChange = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchLeads();
  };

  const onSourceChange = async (id: string, source: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    fetchLeads();
  };

  const onManagerChange = async (id: string, managerId: string | null) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: managerId }),
    });
    fetchLeads();
  };

  const quickCall = (phone: string) => { window.open(`tel:${phone}`, '_blank'); };
  const quickMessage = (phone: string) => { window.open(`https://t.me/${phone.replace(/[^0-9]/g, '')}`, '_blank'); };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleAll = () => {
    setSelectedIds(prev => prev.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  };
  const clearSelection = () => { setSelectedIds(new Set()); setBulkAction(null); };

  const executeBulk = async (action: string, value?: string) => {
    if (!selectedIds.size) return;
    const res = await fetch('/api/leads/bulk', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds), action, value }),
    });
    if (res.ok) {
      const data = await res.json();
      const count = data.deleted ?? data.updated ?? 0;
      toast.success(`${t('common.updated')}: ${count}`);
      clearSelection();
      fetchLeads();
    } else toast.error(t('common.error'));
  };

  const handleBulkDelete = async () => {
    const ok = await confirmAction(`${t('leads.deleteLead')} (${selectedIds.size})`, { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await executeBulk('delete');
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const XLSX = (await import('xlsx')).default;
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      if (rows.length === 0) { toast.error(t('common.noData')); setImporting(false); return; }
      const res = await fetch('/api/leads/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: rows }),
      });
      const result = await res.json();
      toast.success(`${t('leads.importExcel')}: ${result.imported}`);
      if (result.errors?.length) { result.errors.forEach((err: string) => toast.error(err)); }
      fetchLeads();
    } catch { toast.error(t('common.error')); }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight"><HintTooltip text={t('hints.leads')} position="bottom">{t('leads.title')}</HintTooltip></h1>
            <p className="text-xs text-muted-foreground mt-0.5">{leads.length} {t('common.contacts')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className={cn('flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm font-semibold cursor-pointer hover:bg-muted transition active:scale-95',
            importing && 'opacity-50 pointer-events-none')}>
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">{importing ? t('leads.importing') : 'Excel'}</span>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelImport} disabled={importing} />
          </label>
          <button onClick={() => { setEditing(null); setShowDialog(true); }}
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('leads.addLead')}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('leads.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">{t('common.allStatuses')}</option>
            {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">{t('common.allSources')}</option>
            {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {managers.length > 1 && (
            <select value={managerFilter} onChange={e => setManagerFilter(e.target.value)}
              className="px-3 py-2 border border-border/60 dark:border-border/40 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">{t('common.allManagers')}</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
            </select>
          )}
          <div className="flex bg-card rounded-xl border border-border/60 dark:border-border/40 p-0.5 ml-auto">
            <button onClick={() => setViewMode('table')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'table' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('kanban')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'kanban' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && viewMode === 'table' && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{t('leads.bulk.selected')}: {selectedIds.size}</span>
          <div className="flex-1" />
          {bulkAction === 'status' ? (
            <div className="flex items-center gap-2">
              <select autoFocus onChange={e => { if (e.target.value) executeBulk('status', e.target.value); }}
                className="px-2 py-1.5 border border-border rounded-lg text-sm bg-card">
                <option value="">{t('common.selectStatus')}</option>
                {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{t(`const.leadStatus.${s.value}`) || s.label}</option>)}
              </select>
              <button onClick={() => setBulkAction(null)} className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4" /></button>
            </div>
          ) : bulkAction === 'assign' ? (
            <div className="flex items-center gap-2">
              <select autoFocus onChange={e => { if (e.target.value) executeBulk('assign', e.target.value); }}
                className="px-2 py-1.5 border border-border rounded-lg text-sm bg-card">
                <option value="">{t('common.selectManager')}</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
              </select>
              <button onClick={() => setBulkAction(null)} className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <>
              <button onClick={() => setBulkAction('status')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition">
                <Tag className="w-3.5 h-3.5" /> {t('leads.bulk.changeStatus')}
              </button>
              <button onClick={() => setBulkAction('assign')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition">
                <UserCheck className="w-3.5 h-3.5" /> {t('leads.bulk.assignManager')}
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition">
                <Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
              </button>
            </>
          )}
          <button onClick={clearSelection} className="p-1.5 hover:bg-muted rounded-lg transition ml-1" title="Скасувати">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {viewMode === 'table' ? (
        <LeadTable leads={leads} loading={loading}
          onEdit={l => { setEditing(l); setShowDialog(true); }}
          onDelete={id => onDelete(id)}
          onCall={quickCall} onMessage={quickMessage}
          onStatusChange={onStatusChange}
          onSourceChange={onSourceChange}
          onManagerChange={onManagerChange}
          managers={managers}
          sortBy={sortBy} sortDir={sortDir}
          onSort={(col: string) => {
            if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
            else { setSortBy(col); setSortDir('asc'); }
          }}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll} />
      ) : (
        <LeadKanban leads={leads} loading={loading}
          onEdit={l => { setEditing(l); setShowDialog(true); }}
          onStatusChange={onStatusChange}
          onCall={quickCall} onMessage={quickMessage} />
      )}

      {showDialog && (
        <LeadDialog lead={editing} onSave={onSave} onClose={() => { setShowDialog(false); setEditing(null); }} />
      )}
    </div>
  );
}
