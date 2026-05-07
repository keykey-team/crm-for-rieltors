'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HintTooltip } from '@/components/hint-tooltip';
import { Plus, Workflow } from 'lucide-react';
import { DEAL_STAGES } from '@/lib/constants';
import { FunnelBoard } from './funnel-board';
import { DealDialog } from './deal-dialog';
import { useTranslation } from '@/lib/i18n/context';
import { confirmAction } from '@/lib/confirm-action';

export function DealsClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get('create') === '1') { setEditDeal(null); setDialogOpen(true); }
  }, [searchParams]);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/deals');
    const data = await res.json();
    setDeals(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleStageChange = async (dealId: string, newStage: string) => {
    await fetch(`/api/deals/${dealId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });
    setDeals((prev) => (prev ?? []).map((d: any) => d?.id === dealId ? { ...(d ?? {}), stage: newStage } : d));
  };

  const handleSave = async (data: any) => {
    if (editDeal) {
      await fetch(`/api/deals/${editDeal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
      await fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    setDialogOpen(false); setEditDeal(null); fetchDeals();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction(t('deals.deleteDeal'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    fetchDeals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">
              <HintTooltip text={t('hints.deals')} position="bottom">{t('deals.dealFunnel')}</HintTooltip>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('deals.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setEditDeal(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('deals.addDeal')}</span>
        </button>
      </div>
      <FunnelBoard deals={deals} loading={loading} onStageChange={handleStageChange}
        onEdit={(d: any) => { setEditDeal(d); setDialogOpen(true); }} onDelete={handleDelete} />
      {dialogOpen && <DealDialog deal={editDeal} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditDeal(null); }} />}
    </div>
  );
}
