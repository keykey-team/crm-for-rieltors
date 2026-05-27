'use client';

import { Trash2, UserCheck, Tag, X } from 'lucide-react';

type Option = { value: string; label: string; color?: string };
type Manager = { id: string; name?: string | null; email?: string | null };

interface Props {
  selectedCount: number;
  bulkAction: 'status' | 'assign' | null;
  setBulkAction: (value: 'status' | 'assign' | null) => void;
  executeBulk: (action: string, value?: string) => void | Promise<void>;
  handleBulkDelete: () => void | Promise<void>;
  clearSelection: () => void;
  leadStatuses: Option[];
  managers: Manager[];
  t: (key: string) => string;
}

export function LeadsBulkActionsBar({
  selectedCount,
  bulkAction,
  setBulkAction,
  executeBulk,
  handleBulkDelete,
  clearSelection,
  leadStatuses,
  managers,
  t,
}: Props) {
  if (selectedCount <= 0) return null;

  return (
    <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-medium">{t('leads.bulk.selected')}: {selectedCount}</span>
      <div className="flex-1" />
      {bulkAction === 'status' ? (
        <div className="flex items-center gap-2">
          <select autoFocus onChange={(e) => { if (e.target.value) executeBulk('status', e.target.value); }} className="px-2 py-1.5 border border-border rounded-lg text-sm bg-card">
            <option value="">{t('common.selectStatus')}</option>
            {leadStatuses.map((s) => <option key={s.value} value={s.value}>{s.label || t(`const.dealStage.${s.value}`) || s.value}</option>)}
          </select>
          <button onClick={() => setBulkAction(null)} className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4" /></button>
        </div>
      ) : bulkAction === 'assign' ? (
        <div className="flex items-center gap-2">
          <select autoFocus onChange={(e) => { if (e.target.value) executeBulk('assign', e.target.value); }} className="px-2 py-1.5 border border-border rounded-lg text-sm bg-card">
            <option value="">{t('common.selectManager')}</option>
            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
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
      <button onClick={clearSelection} className="p-1.5 hover:bg-muted rounded-lg transition ml-1" title="Cancel">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
