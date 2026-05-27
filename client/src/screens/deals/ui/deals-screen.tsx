'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { useDealsPage } from '@/widgets/deals/model/use-deals-page';
import { DealsHeaderActions } from '@/widgets/deals/ui/deals-header-actions';
import { FunnelBoard } from '@/widgets/deals/ui/funnel-board';
import { DealFormDialog } from '@/features/create-deal/ui/deal-form-dialog';

export function DealsClient() {
  const { t } = useTranslation();
  const {
    deals,
    loading,
    dialogOpen,
    editDeal,
    handleStageChange,
    handleSave,
    handleDelete,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  } = useDealsPage();

  return (
    <div className="space-y-6">
      <DealsHeaderActions onCreate={openCreateDialog} t={t} />
      <FunnelBoard deals={deals} loading={loading} onStageChange={handleStageChange} onEdit={openEditDialog} onDelete={handleDelete} />
      {dialogOpen && <DealFormDialog deal={editDeal} onSave={handleSave} onClose={closeDialog} />}
    </div>
  );
}
