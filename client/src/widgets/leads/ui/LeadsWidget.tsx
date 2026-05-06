'use client';

import { LeadKanban, LeadTable } from '@/entities/lead';
import { LeadDialog } from '@/features/lead-create';
import { useTranslation } from '@/shared/lib/i18n/context';
import { quickCall, quickMessage } from '@/widgets/leads/lib/communication';
import { useLeadsPage } from '@/widgets/leads/model/useLeadsPage';
import { LeadsHeader } from './LeadsHeader';
import { LeadsFilters } from './LeadsFilters';

export function LeadsWidget() {
  const { t } = useTranslation();
  const {
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
  } = useLeadsPage(t);

  return (
    <div>
      <LeadsHeader
        total={leads.length}
        importing={importing}
        t={t}
        onImport={importFromExcel}
        onCreate={() => {
          setEditing(null);
          setShowDialog(true);
        }}
      />

      <LeadsFilters
        filters={filters}
        viewMode={viewMode}
        t={t}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <LeadTable
          leads={leads}
          loading={loading}
          onEdit={(lead) => {
            setEditing(lead);
            setShowDialog(true);
          }}
          onDelete={removeLead}
          onCall={quickCall}
          onMessage={quickMessage}
        />
      ) : (
        <LeadKanban
          leads={leads}
          loading={loading}
          onEdit={(lead) => {
            setEditing(lead);
            setShowDialog(true);
          }}
          onStatusChange={changeLeadStatus}
          onCall={quickCall}
          onMessage={quickMessage}
        />
      )}

      {showDialog && (
        <LeadDialog
          lead={editing}
          onSave={saveLead}
          onClose={() => {
            setShowDialog(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
