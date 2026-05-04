'use client';
import { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatPrice } from '@/shared/lib/format';
import { DEAL_STAGES, LEAD_SOURCES } from '@/shared/lib/constants';
import { useTranslation } from '@/shared/lib/i18n/context';
import dynamic from 'next/dynamic';

const ConversionChart = dynamic(() => import('@/pages/analytics/ui/ConversionChart'), { ssr: false });
const SourceChart = dynamic(() => import('@/pages/analytics/ui/SourceChart'), { ssr: false });

export function AnalyticsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [extended, setExtended] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/analytics/extended').then(r => r.json()),
      fetch('/api/leads').then(r => r.json()),
    ]).then(([s, ext, leads]) => {
      setStats(s);
      setExtended(ext);
      const sourceData = LEAD_SOURCES.map(src => ({
        name: src.label,
        value: (Array.isArray(leads) ? leads : []).filter((l: any) => l.source === src.value).length,
      })).filter(d => d.value > 0);
      setStats((prev: any) => ({ ...prev, sourceData }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-2xl font-display font-bold">{t('analytics.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label={t('analytics.totalLeads')} value={stats?.totalLeads ?? 0} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard icon={TrendingUp} label={t('analytics.activeDeals')} value={stats?.activeDeals ?? 0} color="text-purple-600" bg="bg-purple-50" />
        <MetricCard icon={DollarSign} label={t('analytics.revenue')}
          value={formatPrice(extended?.totalRevenue ?? 0)} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={DollarSign} label={t('analytics.commission')}
          value={formatPrice(extended?.totalCommission ?? 0)} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.avgDealSize')}</p>
          <p className="text-xl font-mono font-bold">{formatPrice(extended?.avgDealSize ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.closedDeals')}</p>
          <p className="text-xl font-mono font-bold">{extended?.closedDealsCount ?? 0} <span className="text-sm text-muted-foreground font-normal">{t('analytics.from')} {extended?.totalDeals ?? 0}</span></p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground mb-1">{t('analytics.conversion')}</p>
          <p className="text-xl font-mono font-bold">
            {extended?.totalDeals ? Math.round(((extended?.closedDealsCount ?? 0) / extended.totalDeals) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> {t('analytics.conversionByStage')}
          </h2>
          <ConversionChart data={convData} />
        </div>
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> {t('analytics.leadSources')}
          </h2>
          <SourceChart data={stats?.sourceData ?? []} />
        </div>
      </div>

      {(extended?.agentStats ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
                {extended.agentStats.map((agent: any) => (
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

function MetricCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-mono font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
