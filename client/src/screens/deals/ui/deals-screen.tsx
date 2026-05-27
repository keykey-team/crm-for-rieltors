'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { useDealsPage } from '@/widgets/deals/model/use-deals-page';
import { DealsHeaderActions } from '@/widgets/deals/ui/deals-header-actions';
import { DealsFilterDialog } from '@/widgets/deals/ui/deals-filter-dialog';
import { FunnelBoard } from '@/widgets/deals/ui/funnel-board';
import { DealFormDialog } from '@/features/create-deal/ui/deal-form-dialog';

export function DealsClient() {
  const { t } = useTranslation();
  const {
    deals,
    funnels,
    selectedFunnelId,
    setSelectedFunnelId,
    selectedStages,
    managers,
    filtersOpen,
    setFiltersOpen,
    filters,
    setFilters,
    activeFilterCount,
    loading,
    dialogOpen,
    editDeal,
    handleStageChange,
    handleFunnelChange,
    handleSave,
    handleDelete,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  } = useDealsPage();

  return (
    <div className="space-y-6">
      <DealsHeaderActions
        onCreate={openCreateDialog}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        funnels={funnels}
        selectedFunnelId={selectedFunnelId}
        onSelectFunnel={setSelectedFunnelId}
        t={t}
      />
      <FunnelBoard
        deals={deals}
        loading={loading}
        stages={selectedStages}
        funnels={funnels}
        selectedFunnelId={selectedFunnelId}
        onStageChange={handleStageChange}
        onFunnelChange={handleFunnelChange}
        onEdit={openEditDialog}
        onDelete={handleDelete}
      />
      {filtersOpen ? (
        <DealsFilterDialog
          filters={filters}
          stages={selectedStages}
          managers={managers}
          onApply={(next) => { setFilters(next); setFiltersOpen(false); }}
          onClose={() => setFiltersOpen(false)}
          t={t}
        />
      ) : null}
      {dialogOpen && <DealFormDialog deal={editDeal} onSave={handleSave} onClose={closeDialog} preferredFunnelId={selectedFunnelId} />}
    </div>
  );
}
