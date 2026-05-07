'use client';
import { useTranslation } from '@/lib/i18n/context';
import dynamic from 'next/dynamic';
import { Workflow } from 'lucide-react';
import { DEAL_STAGES } from '@/lib/constants';

const BarChartComponent = dynamic(() => import('./bar-chart-inner'), { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" /> });

export function FunnelChart({ data }: { data: any[] }) {
  const { t } = useTranslation();
  const chartData = DEAL_STAGES.map((stage: any) => {
    const found = (data ?? []).find((d: any) => d?.stage === stage.value);
    const _t = t(`const.dealStage.${stage.value}`); return { name: _t && !_t.startsWith('const.') ? _t : stage.label, value: found?._count?.id ?? 0, fill: stage.color };
  }).filter((d: any) => d.value > 0);

  return (
    <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center">
          <Workflow className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-display font-semibold">{t('dashboard.funnelTitle')}</h3>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
      ) : (
        <div className="h-64">
          <BarChartComponent data={chartData} />
        </div>
      )}
    </div>
  );
}
