'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { LEAD_STATUSES, LEAD_SOURCES } from '@/shared/lib/constants';
import { confirmAction } from '@/shared/lib/confirm-action';
import { useTranslation } from '@/shared/lib/i18n/context';
import type { Lead, LeadUpsertInput } from '@/entities/lead';
import { bulkLeadsAction, createLead, deleteLead, getLeads, importLeads, updateLead } from '@/entities/lead';
import type { User } from '@/entities/user';
import { getUsers } from '@/entities/user';

export function useLeadsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [managers, setManagers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [importing, setImporting] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'status' | 'assign' | null>(null);

  useEffect(() => {
    getUsers().then(setManagers).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditing(null);
      setShowDialog(true);
    }
  }, [searchParams]);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads({
        search: search || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        managerId: managerFilter || undefined,
      });
      setLeads(data);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, managerFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onSave = async (data: LeadUpsertInput) => {
    try {
      if (editing) await updateLead(editing.id, data);
      else await createLead(data);
      toast.success(editing ? t('common.updated') : t('common.created'));
      setShowDialog(false);
      setEditing(null);
      fetchLeads();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const onDelete = async (id: string) => {
    const ok = await confirmAction(t('leads.deleteLead'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteLead(id);
    toast.success(t('common.deleted'));
    fetchLeads();
  };

  const onStatusChange = async (id: string, status: string) => {
    await updateLead(id, { status });
    fetchLeads();
  };

  const onSourceChange = async (id: string, source: string) => {
    await updateLead(id, { source });
    fetchLeads();
  };

  const onManagerChange = async (id: string, managerId: string | null) => {
    await updateLead(id, { assignedToId: managerId ?? '' });
    fetchLeads();
  };

  const quickCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const quickMessage = (phone: string) => {
    window.open(`https://t.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.size === leads.length ? new Set() : new Set(leads.map((lead) => lead.id))));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const executeBulk = async (action: string, value?: string) => {
    if (!selectedIds.size) return;
    try {
      const data = await bulkLeadsAction({ ids: Array.from(selectedIds), action, value });
      const count = data.deleted ?? data.updated ?? 0;
      toast.success(`${t('common.updated')}: ${count}`);
      clearSelection();
      fetchLeads();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleBulkDelete = async () => {
    const ok = await confirmAction(`${t('leads.deleteLead')} (${selectedIds.size})`, {
      confirm: t('common.delete'),
      cancel: t('common.cancel'),
    });
    if (!ok) return;
    await executeBulk('delete');
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const XLSX = (await import('xlsx')).default;
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
      if (rows.length === 0) {
        toast.error(t('common.noData'));
        setImporting(false);
        return;
      }
      const result = await importLeads(rows);
      toast.success(`${t('leads.importExcel')}: ${result.imported}`);
      if (result.errors?.length) result.errors.forEach((error: string) => toast.error(error));
      fetchLeads();
    } catch {
      toast.error(t('common.error'));
    }
    setImporting(false);
    event.target.value = '';
  };

  const openCreateDialog = () => {
    setEditing(null);
    setShowDialog(true);
  };

  const openEditDialog = (lead: Lead) => {
    setEditing(lead);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditing(null);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortDir('asc');
  };

  return {
    leads,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    managerFilter,
    setManagerFilter,
    managers,
    showDialog,
    editing,
    viewMode,
    setViewMode,
    importing,
    sortBy,
    sortDir,
    selectedIds,
    bulkAction,
    setBulkAction,
    onSave,
    onDelete,
    onStatusChange,
    onSourceChange,
    onManagerChange,
    quickCall,
    quickMessage,
    toggleSelect,
    toggleAll,
    clearSelection,
    executeBulk,
    handleBulkDelete,
    handleExcelImport,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSort,
    leadStatuses: LEAD_STATUSES,
    leadSources: LEAD_SOURCES,
  };
}
