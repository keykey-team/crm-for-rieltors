'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { confirmAction } from '@/shared/lib/confirm-action';
import { useTranslation } from '@/shared/lib/i18n/context';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import { createDeal, deleteDeal, getDeals, updateDeal } from '@/entities/deal';

export function useDealsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditDeal(null);
      setDialogOpen(true);
    }
  }, [searchParams]);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const data = await getDeals();
    setDeals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleStageChange = async (dealId: string, newStage: string) => {
    await updateDeal(dealId, { stage: newStage });
    setDeals((prev) => prev.map((deal) => (deal.id === dealId ? { ...deal, stage: newStage } : deal)));
  };

  const handleSave = async (data: DealUpsertInput) => {
    if (editDeal) await updateDeal(editDeal.id, data);
    else await createDeal(data);
    setDialogOpen(false);
    setEditDeal(null);
    fetchDeals();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction(t('deals.deleteDeal'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteDeal(id);
    fetchDeals();
  };

  const openCreateDialog = () => {
    setEditDeal(null);
    setDialogOpen(true);
  };

  const openEditDialog = (deal: Deal) => {
    setEditDeal(deal);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditDeal(null);
  };

  return {
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
  };
}
