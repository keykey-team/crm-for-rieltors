import { useCallback, useEffect, useState } from 'react';
import { deleteDeal, getDeals, saveDeal, updateDealStage } from '@/widgets/deals/lib/dealsService';

export function useDealsPage(t: (key: string) => string) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any>(null);

  const fetchAllDeals = useCallback(async () => {
    setLoading(true);
    const data = await getDeals();
    setDeals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllDeals();
  }, [fetchAllDeals]);

  const handleStageChange = async (dealId: string, newStage: string) => {
    await updateDealStage(dealId, newStage);
    setDeals((previousDeals) =>
      (previousDeals ?? []).map((deal: any) => (deal?.id === dealId ? { ...(deal ?? {}), stage: newStage } : deal)),
    );
  };

  const handleSave = async (data: any) => {
    await saveDeal(data, editDeal?.id);
    setDialogOpen(false);
    setEditDeal(null);
    fetchAllDeals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deals.deleteDeal'))) {
      return;
    }

    await deleteDeal(id);
    fetchAllDeals();
  };

  return {
    deals,
    loading,
    dialogOpen,
    editDeal,
    setDialogOpen,
    setEditDeal,
    handleStageChange,
    handleSave,
    handleDelete,
  };
}
