'use client';
import { useState, useEffect } from 'react';
import { Users, Workflow, Building, CheckSquare, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { StatsCard } from './stats-card';
import { RecentLeads } from './recent-leads';
import { FunnelChart } from './funnel-chart';
import { cn } from '@/lib/utils';
import { DEAL_STAGES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/context';
import Link from 'next/link';

export function DashboardClient() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-2xl font-display font-bold">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label={t('dashboard.totalLeads')} value={stats?.totalLeads ?? 0}
          sub={`${stats?.newLeads ?? 0} ${t('common.newCount')}`} color="text-blue-600" bg="bg-blue-50" />
        <StatsCard icon={Workflow} label={t('dashboard.activeDeals')} value={stats?.activeDeals ?? 0}
          sub={`${stats?.totalDeals ?? 0} ${t('common.totalCount')}`} color="text-purple-600" bg="bg-purple-50" />
        <StatsCard icon={Building} label={t('dashboard.properties')} value={stats?.totalProperties ?? 0}
          sub={t('common.inDatabase')} color="text-emerald-600" bg="bg-emerald-50" />
        <StatsCard icon={CheckSquare} label={t('dashboard.pendingTasks')} value={stats?.todayTasks ?? 0}
          sub={`${stats?.pendingTasks ?? 0} ${t('common.waiting')}`} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads leads={stats?.recentLeads ?? []} />
        <FunnelChart data={stats?.dealsByStage ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
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

        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="font-display font-semibold">{t('dashboard.upcomingEvents')}</h2>
          </div>
          {(stats?.upcomingEvents ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.noUpcoming')}</p>
          ) : (
            <div className="space-y-2">
              {stats.upcomingEvents.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
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
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <h2 className="font-display font-semibold">{t('dashboard.todayTasks')}</h2>
          </div>
          <div className="space-y-2">
            {stats.todayTasksList.map((tk: any) => (
              <div key={tk.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition">
                <div>
                  <p className="text-sm font-medium">{tk.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {tk.lead ? `${tk.lead.firstName} ${tk.lead.lastName ?? ''}` : ''}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full',
                  tk.priority === 'high' ? 'bg-red-100 text-red-600' :
                  tk.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                )}>{tk.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
