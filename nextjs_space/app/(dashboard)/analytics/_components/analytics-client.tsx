'use client';
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import { DEAL_STAGES, LEAD_SOURCES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n/context';
import { HintTooltip } from '@/components/hint-tooltip';
import dynamic from 'next/dynamic';

const ConversionChart = dynamic(() => import('./conversion-chart'), { ssr: false });
const SourceChart = dynamic(() => import('./source-chart'), { ssr: false });

type Period = 'week' | 'month' | 'quarter' | 'year' | 'all';

function getPeriodDates(period: Period): { from?: string; to?: string } {
  if (period === 'all') return {};
  const now = new Date();
  const to = now.toISOString();
  const d = new Date(now);
  if (period === 'week') d.setDate(d.getDate() - 7);
  else if (period === 'month') d.setMonth(d.getMonth() - 1);
  else if (period === 'quarter') d.setMonth(d.getMonth() - 3);
  else if (period === 'year') d.setFullYear(d.getFullYear() - 1);
  return { from: d.toISOString(), to };
}

export function AnalyticsClient() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [extended, setExtended] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');

  const fetchData = useCallback(() => {
    setLoading(true);
    const { from, to } = getPeriodDates(period);
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch(`/api/analytics/extended${suffix}`).then(r => r.json()),
      fetch(`/api/leads${suffix}`).then(r => r.json()),
    ]).then(([s, ext, leads]) => {
      setStats(s);
      setExtended(ext);
      const sourceData = LEAD_SOURCES.map(src => ({
        name: src.label,
        value: (Array.isArray(leads) ? leads : []).filter((l: any) => l.source === src.value).length,
      })).filter(d => d.value > 0);
      setStats((prev: any) => ({ ...prev, sourceData }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const convData = (stats?.dealsByStage ?? []).map((d: any) => {
    const stage = DEAL_STAGES.find(s => s.value === d.stage);
    return { name: stage?.label ?? d.stage, value: d._count?.id ?? 0, fill: stage?.color ?? '#8b5cf6' };
  }).filter((d: any) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight"><HintTooltip text={t('hints.analytics')} position="bottom">{t('analytics.title')}</HintTooltip></h1>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 dark:bg-muted/30 p-1 rounded-xl">
          {(['week', 'month', 'quarter', 'year', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                period === p ? 'bg-card dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {t(`analytics.period.${p}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label={t('analytics.totalLeads')} value={stats?.totalLeads ?? 0} gradient="from-[#073B34] to-[#0a5a4f]" />
        <MetricCard icon={TrendingUp} label={t('analytics.activeDeals')} value={stats?.activeDeals ?? 0} gradient="from-[#073B34] to-emerald-800" />
        <MetricCard icon={DollarSign} label={t('analytics.revenue')}
          value={formatPrice(extended?.totalRevenue ?? 0)} gradient="from-emerald-700 to-[#073B34]" />
        <MetricCard icon={DollarSign} label={t('analytics.commission')}
          value={formatPrice(extended?.totalCommission ?? 0)} gradient="from-[#0a5a4f] to-emerald-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.avgDealSize')}</p>
          <p className="text-xl font-mono font-bold">{formatPrice(extended?.avgDealSize ?? 0)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.closedDeals')}</p>
          <p className="text-xl font-mono font-bold">{extended?.closedDealsCount ?? 0} <span className="text-sm text-muted-foreground font-normal">{t('analytics.from')} {extended?.totalDeals ?? 0}</span></p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.conversion')}</p>
          <p className="text-xl font-mono font-bold">
            {extended?.totalDeals ? Math.round(((extended?.closedDealsCount ?? 0) / extended.totalDeals) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> {t('analytics.conversionByStage')}
          </h2>
          <ConversionChart data={convData} />
        </div>
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> {t('analytics.leadSources')}
          </h2>
          <SourceChart data={stats?.sourceData ?? []} />
        </div>
      </div>

      {(extended?.agentStats ?? []).filter((a: any) => a.leadsCount > 0 || a.dealsCount > 0 || a.tasksCompleted > 0).length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-5">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> {t('analytics.agentActivity')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('analytics.agent')}</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">{t('analytics.leadsCol')}</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">{t('analytics.dealsCol')}</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">{t('analytics.tasksCompleted')}</th>
                </tr>
              </thead>
              <tbody>
                {extended.agentStats.filter((a: any) => a.leadsCount > 0 || a.dealsCount > 0 || a.tasksCompleted > 0).map((agent: any) => (
                  <tr key={agent.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{agent.name}</td>
                    <td className="px-4 py-3 text-center">{agent.leadsCount}</td>
                    <td className="px-4 py-3 text-center">{agent.dealsCount}</td>
                    <td className="px-4 py-3 text-center">{agent.tasksCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string | number; gradient: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
          <p className="text-lg font-mono font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
