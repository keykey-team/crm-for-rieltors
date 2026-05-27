'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { LeadFormDialog } from '@/features/create-lead/ui/lead-form-dialog';
import { LeadTable } from '@/widgets/leads/ui/lead-table';
import { LeadKanban } from '@/widgets/leads/ui/lead-kanban';

import { useLeadsPage } from '@/widgets/leads/model/use-leads-page';
import { LeadsBulkActionsBar } from '@/widgets/leads/ui/leads-bulk-actions-bar';
import { LeadsFiltersBar } from '@/widgets/leads/ui/leads-filters-bar';
import { LeadsHeaderActions } from '@/widgets/leads/ui/leads-header-actions';

export function LeadsClient() {
  const { t } = useTranslation();
  const {
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
    onLastContactChange,
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
    leadStatuses,
    leadSources,
  } = useLeadsPage();

  return (
    <div>
      <LeadsHeaderActions
        leadsCount={leads.length}
        importing={importing}
        handleExcelImport={handleExcelImport}
        openCreateDialog={openCreateDialog}
        t={t}
      />

      <LeadsFiltersBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        managerFilter={managerFilter}
        setManagerFilter={setManagerFilter}
        managers={managers}
        leadStatuses={leadStatuses}
        leadSources={leadSources}
        viewMode={viewMode}
        setViewMode={setViewMode}
        t={t}
      />

      {viewMode === 'table' && (
        <LeadsBulkActionsBar
          selectedCount={selectedIds.size}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          executeBulk={executeBulk}
          handleBulkDelete={handleBulkDelete}
          clearSelection={clearSelection}
          leadStatuses={leadStatuses}
          managers={managers}
          t={t}
        />
      )}

      {viewMode === 'table' ? (
        <LeadTable
          leads={leads}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={onDelete}
          onCall={quickCall}
          onMessage={quickMessage}
          onStatusChange={onStatusChange}
          onSourceChange={onSourceChange}
          onManagerChange={onManagerChange}
          onLastContactChange={onLastContactChange}
          managers={managers}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          leadStatuses={leadStatuses}
        />
      ) : (
        <LeadKanban
          leads={leads}
          loading={loading}
          onEdit={openEditDialog}
          onStatusChange={onStatusChange}
          onCall={quickCall}
          onMessage={quickMessage}
          leadStatuses={leadStatuses}
        />
      )}

      {showDialog && <LeadFormDialog lead={editing} onSave={onSave} onClose={closeDialog} leadStatuses={leadStatuses} />}
    </div>
  );
}
