'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { toast } from 'sonner';
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

type StageBucket = {
  items: Deal[];
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
};

const DEALS_PAGE_SIZE = 12;

function mergeDealsById(currentItems: Deal[], nextItems: Deal[]) {
  const uniqueDeals = new Map(currentItems.map((deal) => [deal.id, deal]));
  nextItems.forEach((deal) => uniqueDeals.set(deal.id, deal));
  return Array.from(uniqueDeals.values());
}

export function useDealsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [stagesByFunnel, setStagesByFunnel] = useState<Record<string, FunnelStage[]>>({});
  const [stageBuckets, setStageBuckets] = useState<Record<string, StageBucket>>({});
  const [managers, setManagers] = useState<User[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilters>({ query: '', stage: '', managerId: '', currency: '' });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);

  const boardKey = useMemo(() => [selectedFunnelId, filters.query, filters.stage, filters.managerId, filters.currency].join('|'), [filters.currency, filters.managerId, filters.query, filters.stage, selectedFunnelId]);
  const boardKeyRef = useRef(boardKey);
  const refreshIdRef = useRef(0);

  useEffect(() => {
    boardKeyRef.current = boardKey;
  }, [boardKey]);

  useEffect(() => {
    if (searchParams?.get('create') === '1') {
      setEditDeal(null);
      setDialogOpen(true);
    }
  }, [searchParams]);

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
    void fetchFunnelsMeta();
  }, [fetchFunnelsMeta]);

  const selectedStages = useMemo(() => {
    if (!selectedFunnelId) return [];
    return stagesByFunnel[selectedFunnelId] ?? [];
  }, [selectedFunnelId, stagesByFunnel]);

  const refreshBoard = useCallback(async () => {
    const currentKey = ++refreshIdRef.current;
    const funnelId = selectedFunnelId;

    if (!funnelId) {
      setStageBuckets({});
      setLoading(false);
      return;
    }

    const funnelStages = stagesByFunnel[funnelId] ?? [];
    if (funnelStages.length === 0) {
      setStageBuckets({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const stagesToLoad = filters.stage ? funnelStages.filter((stage) => stage.value === filters.stage) : funnelStages;
    const responsePairs = await Promise.all(stagesToLoad.map(async (stage) => {
      const response = await getDeals({
        page: 1,
        limit: DEALS_PAGE_SIZE,
        funnelId,
        stage: stage.value,
        managerId: filters.managerId || undefined,
        currency: filters.currency || undefined,
        query: filters.query || undefined,
      }).catch(() => ({ items: [], total: 0, page: 1, limit: DEALS_PAGE_SIZE, hasMore: false }));

      return [stage.value, {
        items: response.items,
        page: response.page,
        total: response.total,
        hasMore: response.hasMore,
        loadingMore: false,
      }] as const;
    }));

    if (boardKeyRef.current !== [funnelId, filters.query, filters.stage, filters.managerId, filters.currency].join('|') || currentKey !== refreshIdRef.current) return;
    setStageBuckets(Object.fromEntries(responsePairs));
    setLoading(false);
  }, [filters.currency, filters.managerId, filters.query, filters.stage, selectedFunnelId, stagesByFunnel]);

  useEffect(() => {
    void refreshBoard();
  }, [refreshBoard]);

  const activeFilterCount = [filters.query, filters.stage, filters.managerId, filters.currency].filter(Boolean).length;

  const handleStageChange = async (dealId: string, newStage: string) => {
    const result = await updateDeal(dealId, { stage: newStage });
    if (result._affectedCount && result._affectedCount > 0) {
      toast.info(`${result._affectedCount} угод автоматично переведено в "Об'єкт скасовано"`, {
        duration: 5000,
      });
    }
    await refreshBoard();
  };

  const handleFunnelChange = async (dealId: string, funnelId: string) => {
    const deal = Object.values(stageBuckets).flatMap((bucket) => bucket.items).find((item) => item.id === dealId);
    if (!deal) return;

    const targetStages = stagesByFunnel[funnelId] ?? await getFunnelStages(funnelId).catch(() => []);
    if (!stagesByFunnel[funnelId] && targetStages.length > 0) {
      setStagesByFunnel((prev) => ({ ...prev, [funnelId]: targetStages }));
    }

    const nextStage = targetStages.some((stage) => stage.value === deal.stage)
      ? deal.stage
      : targetStages[0]?.value ?? deal.stage;

    await updateDeal(dealId, { funnelId, stage: nextStage });
    await refreshBoard();
  };

  const handleSave = async (data: DealUpsertInput) => {
    const payload = editDeal ? data : { ...data, funnelId: data.funnelId ?? selectedFunnelId ?? null };
    if (editDeal) await updateDeal(editDeal.id, payload);
    else await createDeal(payload);
    setDialogOpen(false);
    setEditDeal(null);
    await refreshBoard();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction(t('deals.deleteDeal'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteDeal(id);
    await refreshBoard();
  };

  const loadMoreStage = useCallback(async (stageValue: string) => {
    const funnelId = selectedFunnelId;
    if (!funnelId) return;

    const bucket = stageBuckets[stageValue];
    if (!bucket || bucket.loadingMore || !bucket.hasMore) return;

    const requestKey = boardKeyRef.current;
    setStageBuckets((prev) => ({
      ...prev,
      [stageValue]: { ...prev[stageValue], loadingMore: true },
    }));

    const response = await getDeals({
      page: bucket.page + 1,
      limit: DEALS_PAGE_SIZE,
      funnelId,
      stage: stageValue,
      managerId: filters.managerId || undefined,
      currency: filters.currency || undefined,
      query: filters.query || undefined,
    }).catch(() => ({ items: [], total: bucket.total, page: bucket.page + 1, limit: DEALS_PAGE_SIZE, hasMore: false }));

    if (requestKey !== boardKeyRef.current) return;

    setStageBuckets((prev) => ({
      ...prev,
      [stageValue]: {
        items: mergeDealsById(prev[stageValue]?.items ?? [], response.items),
        page: response.page,
        total: response.total,
        hasMore: response.hasMore,
        loadingMore: false,
      },
    }));
  }, [filters.currency, filters.managerId, filters.query, selectedFunnelId, stageBuckets]);

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
    stageBuckets,
    loadMoreStage,
    handleStageChange,
    handleFunnelChange,
    handleSave,
    handleDelete,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  };
}
