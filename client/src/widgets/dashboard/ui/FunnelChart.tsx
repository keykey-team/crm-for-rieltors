'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import dynamic from 'next/dynamic';
import { Workflow } from 'lucide-react';
import { DEAL_STAGES } from '@/shared/lib/constants';

const BarChartComponent = dynamic(() => import('@/widgets/dashboard/ui/BarChartInner'), { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" /> });

export function FunnelChart({ data }: { data: any[] }) {
  const { t } = useTranslation();
  const chartData = DEAL_STAGES.map((stage: any) => {
    const found = (data ?? []).find((d: any) => d?.stage === stage.value);
    return { name: t(`const.dealStage.${stage.value}`) || stage.label, value: found?._count?.id ?? 0, fill: stage.color };
  }).filter((d: any) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">Воронка угод</h3>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Даних поки немає</p>
      ) : (
        <div className="h-64">
          <BarChartComponent data={chartData} />
        </div>
      )}
    </div>
  );
}
