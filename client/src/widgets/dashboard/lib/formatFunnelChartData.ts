import { DEAL_STAGES } from '@/shared/lib/constants';

interface StageCount {
  stage?: string;
  _count?: { id?: number };
}

export function formatFunnelChartData(
  data: StageCount[],
  translate: (key: string) => string,
) {
  return DEAL_STAGES.map((stage: any) => {
    const foundStage = (data ?? []).find((item) => item?.stage === stage.value);
    return {
      name: translate(`const.dealStage.${stage.value}`) || stage.label,
      value: foundStage?._count?.id ?? 0,
      fill: stage.color,
    };
  }).filter((item) => item.value > 0);
}
