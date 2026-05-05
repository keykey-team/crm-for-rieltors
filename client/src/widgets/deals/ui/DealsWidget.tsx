'use client';

import { Plus, Workflow } from 'lucide-react';
import { FunnelBoard } from '@/entities/deal';
import { DealDialog } from '@/features/deal-create';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useDealsPage } from '@/widgets/deals/model/useDealsPage';

export function DealsWidget() {
  const { t } = useTranslation();
  const {
    deals,
    loading,
    dialogOpen,
    editDeal,
    setDialogOpen,
    setEditDeal,
    handleStageChange,
    handleSave,
    handleDelete,
  } = useDealsPage(t);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" /> {t('deals.dealFunnel')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('deals.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setEditDeal(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> {t('deals.addDeal')}
        </button>
      </div>

      <FunnelBoard
        deals={deals}
        loading={loading}
        onStageChange={handleStageChange}
        onEdit={(deal: any) => {
          setEditDeal(deal);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />

      {dialogOpen && (
        <DealDialog
          deal={editDeal}
          onSave={handleSave}
          onClose={() => {
            setDialogOpen(false);
            setEditDeal(null);
          }}
        />
      )}
    </div>
  );
}
