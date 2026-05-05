import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { LeadFilters, LeadViewMode } from '@/widgets/leads/model/types';
import { deleteLead, getLeads, importLeads, updateLeadStatus, upsertLead } from '@/widgets/leads/lib/leadsService';

export function useLeadsPage(t: (key: string) => string) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<LeadViewMode>('table');
  const [importing, setImporting] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({ search: '', status: '', source: '' });

  const fetchAllLeads = useCallback(async () => {
    try {
      const data = await getLeads(filters);
      setLeads(data);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  const saveLead = async (data: any) => {
    const response = await upsertLead(data, editing?.id);
    if (!response.ok) {
      toast.error(t('common.error'));
      return;
    }

    toast.success(editing ? t('common.updated') : t('common.created'));
    setShowDialog(false);
    setEditing(null);
    fetchAllLeads();
  };

  const removeLead = async (id: string) => {
    if (!confirm(t('leads.deleteLead'))) {
      return;
    }

    await deleteLead(id);
    toast.success(t('common.deleted'));
    fetchAllLeads();
  };

  const changeLeadStatus = async (id: string, status: string) => {
    await updateLeadStatus(id, status);
    fetchAllLeads();
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImporting(true);
    try {
      const XLSX = (await import('xlsx')).default;
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      if (rows.length === 0) {
        toast.error(t('common.noData'));
        return;
      }

      const result = await importLeads(rows);
      toast.success(`${t('leads.importExcel')}: ${result.imported}`);
      if (result.errors?.length) {
        result.errors.forEach((error: string) => toast.error(error));
      }

      fetchAllLeads();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return {
    leads,
    loading,
    filters,
    showDialog,
    editing,
    viewMode,
    importing,
    setShowDialog,
    setEditing,
    setViewMode,
    setFilters,
    saveLead,
    removeLead,
    changeLeadStatus,
    importFromExcel,
  };
}
