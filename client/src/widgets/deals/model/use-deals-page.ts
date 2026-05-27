'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { confirmAction } from '@/shared/lib/confirm-action';
import { useTranslation } from '@/shared/lib/i18n/context';
import type { Deal, DealUpsertInput } from '@/entities/deal';
import { createDeal, deleteDeal, getDeals, updateDeal } from '@/entities/deal';
import type { Funnel, FunnelStage } from '@/entities/settings';
import { getFunnels, getFunnelStages } from '@/entities/settings';
import type { User } from '@/entities/user';
import { getUsers } from '@/entities/user';

type DealFilters = {
  query: string;
  stage: string;
  managerId: string;
  currency: string;
};

export function useDealsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [stagesByFunnel, setStagesByFunnel] = useState<Record<string, FunnelStage[]>>({});
  const [managers, setManagers] = useState<User[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilters>({ query: '', stage: '', managerId: '', currency: '' });
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

  const fetchFunnelsMeta = useCallback(async () => {
    const [funnelItems, userItems] = await Promise.all([
      getFunnels().catch(() => []),
      getUsers().catch(() => []),
    ]);

    setFunnels(funnelItems);
    setManagers(userItems);
    setSelectedFunnelId((prev) => prev ?? funnelItems.find((item) => item.isDefault)?.id ?? funnelItems[0]?.id ?? null);

    const stagePairs = await Promise.all(
      funnelItems.map(async (funnel) => [funnel.id, await getFunnelStages(funnel.id).catch(() => [])] as const),
    );
    setStagesByFunnel(Object.fromEntries(stagePairs));
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchFunnelsMeta();
  }, [fetchDeals, fetchFunnelsMeta]);

  const selectedStages = useMemo(() => {
    if (!selectedFunnelId) return [];
    return stagesByFunnel[selectedFunnelId] ?? [];
  }, [selectedFunnelId, stagesByFunnel]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (selectedFunnelId && deal.funnelId !== selectedFunnelId) return false;
      if (filters.stage && deal.stage !== filters.stage) return false;
      if (filters.managerId && deal.assignedToId !== filters.managerId) return false;
      if (filters.currency && (deal.currency ?? '') !== filters.currency) return false;
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const haystack = [
          deal.title,
          deal.lead?.firstName,
          deal.lead?.lastName,
          deal.property?.title,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [deals, filters, selectedFunnelId]);

  const activeFilterCount = [filters.query, filters.stage, filters.managerId, filters.currency].filter(Boolean).length;

  const handleStageChange = async (dealId: string, newStage: string) => {
    await updateDeal(dealId, { stage: newStage });
    setDeals((prev) => prev.map((deal) => (deal.id === dealId ? { ...deal, stage: newStage } : deal)));
  };

  const handleFunnelChange = async (dealId: string, funnelId: string) => {
    const deal = deals.find((item) => item.id === dealId);
    if (!deal) return;

    const targetStages = stagesByFunnel[funnelId] ?? await getFunnelStages(funnelId).catch(() => []);
    if (!stagesByFunnel[funnelId] && targetStages.length > 0) {
      setStagesByFunnel((prev) => ({ ...prev, [funnelId]: targetStages }));
    }

    const nextStage = targetStages.some((stage) => stage.value === deal.stage)
      ? deal.stage
      : targetStages[0]?.value ?? deal.stage;

    await updateDeal(dealId, { funnelId, stage: nextStage });
    setDeals((prev) => prev.map((item) => (item.id === dealId ? { ...item, funnelId, stage: nextStage } : item)));
  };

  const handleSave = async (data: DealUpsertInput) => {
    const payload = editDeal ? data : { ...data, funnelId: data.funnelId ?? selectedFunnelId ?? null };
    if (editDeal) await updateDeal(editDeal.id, payload);
    else await createDeal(payload);
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
    deals: filteredDeals,
    rawDeals: deals,
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
  };
}
