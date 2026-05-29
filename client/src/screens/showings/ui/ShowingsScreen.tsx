'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { deleteShowing, type Showing, useShowings } from '@/entities/showing';
import { CreateShowingDialog } from '@/features/create-showing';
import { UpdateShowingDialog } from '@/features/update-showing';
import { ShowingStatusBadge } from '@/entities/showing';
import { formatDateTime } from '@/shared/lib/format';
import { confirmAction } from '@/shared/lib/confirm-action';
import { getUsers } from '@/entities/user';

export function ShowingsClient() {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState('');
  const [agentId, setAgentId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editShowing, setEditShowing] = useState<Showing | null>(null);

  const query = useMemo(
    () => ({ status: status || undefined, agentId: agentId || undefined, from: from || undefined, to: to || undefined, limit: 100 }),
    [agentId, from, status, to],
  );

  const { items, loading, reload } = useShowings(query);

  useEffect(() => {
    getUsers().then(setAgents).catch(() => {});
  }, []);

  const handleDelete = async (showing: Showing) => {
    const confirmed = await confirmAction(t('showings.confirmDelete'));
    if (!confirmed) return;
    try {
      await deleteShowing(showing.id);
      toast.success(t('showings.deleted'));
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight">{t('showings.title')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('showings.subtitle')}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          {t('showings.create')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="">{t('showings.allAgents')}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="">{t('common.all')}</option>
          {['scheduled', 'completed', 'cancelled', 'no_show'].map((item) => (
            <option key={item} value={item}>{t(`showings.status.${item}`)}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <div className="col-span-3">{t('deals.property')}</div>
          <div className="col-span-2">{t('deals.contact')}</div>
          <div className="col-span-2">{t('showings.agent')}</div>
          <div className="col-span-2">{t('showings.scheduledAt')}</div>
          <div className="col-span-1">{t('showings.status')}</div>
          <div className="col-span-2"></div>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">{t('common.loading')}</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">{t('showings.empty')}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-border/60 last:border-b-0 group">
              <div className="col-span-3 truncate">{item.property?.title || item.property?.address || item.propertyId}</div>
              <div className="col-span-2 truncate">{item.lead ? `${item.lead.firstName || ''} ${item.lead.lastName || ''}`.trim() : '—'}</div>
              <div className="col-span-2 truncate">{item.agent?.name || item.agent?.email || '—'}</div>
              <div className="col-span-2 truncate">{formatDateTime(item.scheduledAt, locale)}</div>
              <div className="col-span-1"><ShowingStatusBadge status={item.status} label={t(`showings.status.${item.status}`)} /></div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                {item.dealId && (
                  <Link className="text-primary hover:underline px-1" href={`/deals/${item.dealId}`} title={t('common.open')}>↗</Link>
                )}
                <button
                  onClick={() => setEditShowing(item)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition"
                  title={t('common.edit')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {createOpen ? (
        <CreateShowingDialog
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            toast.success(t('deals.saved'));
            reload();
          }}
        />
      ) : null}

      {editShowing ? (
        <UpdateShowingDialog
          showing={editShowing}
          onClose={() => setEditShowing(null)}
          onSaved={() => {
            setEditShowing(null);
            toast.success(t('deals.saved'));
            reload();
          }}
        />
      ) : null}
    </div>
  );
}
