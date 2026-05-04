'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, LayoutGrid, List, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/shared/lib/constants';
import { LeadTable } from '@/entities/lead';
import { LeadDialog } from '@/features/lead-create';
import { LeadKanban } from '@/entities/lead';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';

export function LeadsPage() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [importing, setImporting] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const onSave = async (data: any) => {
    const url = editing ? `/api/leads/${editing.id}` : '/api/leads';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { toast.success(editing ? t('common.updated') : t('common.created')); setShowDialog(false); setEditing(null); fetchLeads(); }
    else toast.error(t('common.error'));
  };

  const onDelete = async (id: string) => {
    if (!confirm(t('leads.deleteLead'))) return;
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

  const quickCall = (phone: string) => { window.open(`tel:${phone}`, '_blank'); };
  const quickMessage = (phone: string) => { window.open(`https://t.me/${phone.replace(/[^0-9]/g, '')}`, '_blank'); };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t('leads.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{leads.length} {t('common.contacts')}</p>
        </div>
        <div className="flex gap-2">
          <label className={cn('flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition',
            importing && 'opacity-50 pointer-events-none')}>
            <Upload className="w-4 h-4" /> {importing ? t('leads.importing') : 'Excel'}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelImport} disabled={importing} />
          </label>
          <button onClick={() => { setEditing(null); setShowDialog(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> {t('leads.addLead')}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('leads.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">{t('common.allStatuses')}</option>
          {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">{t('common.allSources')}</option>
          {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setViewMode('table')}
            className={cn('p-2 transition', viewMode === 'table' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('kanban')}
            className={cn('p-2 transition', viewMode === 'kanban' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <LeadTable leads={leads} loading={loading}
          onEdit={l => { setEditing(l); setShowDialog(true); }}
          onDelete={id => onDelete(id)}
          onCall={quickCall} onMessage={quickMessage} />
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
