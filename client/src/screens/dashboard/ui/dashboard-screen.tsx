'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Workflow, Building, CheckSquare, AlertTriangle, Calendar, Clock, Check, CalendarPlus, Sparkles, LayoutDashboard } from 'lucide-react';
import { StatsCard } from '@/widgets/dashboard/ui/stats-card';
import { RecentLeads } from '@/widgets/dashboard/ui/recent-leads';
import { FunnelChart } from '@/widgets/dashboard/ui/funnel-chart';
import { cn } from '@/shared/lib/utils';
import { DEAL_STAGES } from '@/shared/lib/constants';
import { formatDateTime } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { toast } from 'sonner';
import Link from 'next/link';
import { getDashboardStats } from '@/entities/dashboard';
import { updateTask } from '@/entities/task';

export function DashboardClient() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const fetchStats = useCallback(() => {
    getDashboardStats()
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const completeTask = async (taskId: string) => {
    setCompletedIds(prev => new Set(prev).add(taskId));
    try {
      await updateTask(taskId, { status: 'completed' });
      toast.success(t('tasks.completed'));
    } catch {
      setCompletedIds(prev => { const n = new Set(prev); n.delete(taskId); return n; });
      toast.error(t('leads.error'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight"><HintTooltip text={t('hints.dashboard')} position="bottom">{t('dashboard.title')}</HintTooltip></h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label={t('dashboard.totalLeads')} value={stats?.totalLeads ?? 0}
          sub={`${stats?.newLeads ?? 0} ${t('common.newCount')}`} color="text-[#073B34] dark:text-[#CEFD56]" bg="bg-[#073B34]/10 dark:bg-[#CEFD56]/10" gradient="bg-gradient-to-br from-[#073B34] to-[#0a5a4f]" href="/leads" />
        <StatsCard icon={Workflow} label={t('dashboard.activeDeals')} value={stats?.activeDeals ?? 0}
          sub={`${stats?.totalDeals ?? 0} ${t('common.totalCount')}`} color="text-[#073B34] dark:text-[#CEFD56]" bg="bg-[#073B34]/10 dark:bg-[#CEFD56]/10" gradient="bg-gradient-to-br from-[#073B34] to-emerald-800" href="/deals" />
        <StatsCard icon={Building} label={t('dashboard.properties')} value={stats?.totalProperties ?? 0}
          sub={t('common.inDatabase')} color="text-emerald-700 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-500/15" gradient="bg-gradient-to-br from-[#0a5a4f] to-emerald-700" href="/properties" />
        <StatsCard icon={CheckSquare} label={t('dashboard.pendingTasks')} value={stats?.todayTasks ?? 0}
          sub={`${stats?.pendingTasks ?? 0} ${t('common.waiting')}`} color="text-[#073B34] dark:text-[#CEFD56]" bg="bg-[#073B34]/10 dark:bg-[#CEFD56]/10" gradient="bg-gradient-to-br from-[#073B34] to-[#0d6b5e]" href="/tasks" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads leads={stats?.recentLeads ?? []} />
        <FunnelChart data={stats?.dealsByStage ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#073B34] to-[#0d6b5e] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display font-semibold">{t('dashboard.riskDeals')}</h2>
            <span className="text-xs text-muted-foreground">{t('dashboard.riskDesc')}</span>
          </div>
          {(stats?.riskDeals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.noRiskDeals')}</p>
          ) : (
            <div className="space-y-2">
              {stats.riskDeals.map((d: any) => {
                const stage = DEAL_STAGES.find(s => s.value === d.stage);
                return (
                  <Link href={`/deals/${d.id}`} key={d.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition">
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.lead ? `${d.lead.firstName} ${d.lead.lastName ?? ''}` : t('common.withoutLead')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: stage?.color + '20', color: stage?.color }}>
                        {stage?.label ?? d.stage}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDateTime(d.updatedAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#073B34] to-[#0a5a4f] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display font-semibold">{t('dashboard.upcomingEvents')}</h2>
          </div>
          {(stats?.upcomingEvents ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('dashboard.noUpcoming')}</p>
              <p className="text-xs text-muted-foreground/70 mb-3">{t('dashboard.noUpcomingHint')}</p>
              <Link href="/calendar" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition">
                <CalendarPlus className="w-3.5 h-3.5" />
                {t('dashboard.addEvent')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.upcomingEvents.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.description ?? ''}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(e.startDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(stats?.todayTasksList ?? []).length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0a5a4f] to-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display font-semibold">{t('dashboard.todayTasks')}</h2>
          </div>
          <div className="space-y-2">
            {stats.todayTasksList.filter((tk: any) => !completedIds.has(tk.id)).map((tk: any) => (
              <div key={tk.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition group">
                <button
                  onClick={() => completeTask(tk.id)}
                  className="w-6 h-6 min-w-[24px] rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  title={t('tasks.complete')}
                >
                  <Check className="w-3 h-3 text-muted-foreground/0 group-hover:text-emerald-500 transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tk.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tk.lead ? `${tk.lead.firstName} ${tk.lead.lastName ?? ''}` : ''}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                  tk.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-500/20' :
                  tk.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-500/20'
                )}>{tk.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
