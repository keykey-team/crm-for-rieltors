'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shield, Filter, Clock, User, ArrowRight, Trash2, Edit2, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatDateTime } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';

export function ActivityLogPage() {
  const { t } = useTranslation();

  const ENTITY_TYPES = [
    { value: '', label: t('common.all') },
    { value: 'lead', label: t('activityLog.entity.lead') },
    { value: 'deal', label: t('activityLog.entity.deal') },
    { value: 'task', label: t('activityLog.entity.task') },
    { value: 'property', label: t('activityLog.entity.property') },
    { value: 'event', label: t('activityLog.entity.event') },
    { value: 'automation', label: t('activityLog.entity.automation') },
    { value: 'user', label: t('activityLog.entity.user') },
  ];

  const ACTION_ICONS: Record<string, typeof Plus> = {
    create: Plus, update: Edit2, delete: Trash2,
    stage_change: ArrowRight, status_change: ArrowRight, assign: User,
  };
  const ACTION_COLORS: Record<string, string> = {
    create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700', stage_change: 'bg-purple-100 text-purple-700',
    status_change: 'bg-amber-100 text-amber-700', assign: 'bg-cyan-100 text-cyan-700',
  };
  const ACTION_LABELS: Record<string, string> = {
    create: t('activityLog.create'), update: t('activityLog.update'), delete: t('activityLog.delete'),
    stage_change: t('activityLog.stageChange'), status_change: t('activityLog.statusChange'), assign: t('activityLog.assign'),
  };

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set('entityType', entityType);
      const res = await fetch(`/api/activity-log?${params}`);
      if (res.ok) setLogs(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [entityType]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-display font-bold">{t('activityLog.title')}</h1>
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-xl hover:bg-muted transition">
          <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={entityType} onChange={e => setEntityType(e.target.value)}
          className="text-sm border border-border rounded-xl px-3 py-2 bg-white">
          {ENTITY_TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('activityLog.noRecords')}</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const Icon = ACTION_ICONS[log.action] ?? Edit2;
            const color = ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700';
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border/50 hover:border-primary/20 transition" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                      {ENTITY_TYPES.find(tp => tp.value === log.entityType)?.label ?? log.entityType}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">{log.details}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                  {log.user && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{log.user.name ?? log.user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
