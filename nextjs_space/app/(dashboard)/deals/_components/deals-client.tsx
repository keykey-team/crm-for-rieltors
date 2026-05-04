'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Workflow } from 'lucide-react';
import { DEAL_STAGES } from '@/lib/constants';
import { FunnelBoard } from './funnel-board';
import { DealDialog } from './deal-dialog';
import { useTranslation } from '@/lib/i18n/context';

export function DealsClient() {
  const { t } = useTranslation();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any>(null);

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
    if (!confirm(t('deals.deleteDeal'))) return;
    await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    fetchDeals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" /> {t('deals.dealFunnel')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('deals.subtitle')}</p>
        </div>
        <button onClick={() => { setEditDeal(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t('deals.addDeal')}
        </button>
      </div>
      <FunnelBoard deals={deals} loading={loading} onStageChange={handleStageChange}
        onEdit={(d: any) => { setEditDeal(d); setDialogOpen(true); }} onDelete={handleDelete} />
      {dialogOpen && <DealDialog deal={editDeal} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditDeal(null); }} />}
    </div>
  );
}
