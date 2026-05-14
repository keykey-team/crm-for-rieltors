import { DEAL_STAGES } from '@/shared/lib/constants';

export function DealStageBadge({ stage, t }: { stage?: string | null; t: (k: string) => string }) {
  const found = DEAL_STAGES.find((s) => s.value === stage);
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (found?.color ?? '#999') + '20', color: found?.color ?? '#999' }}>
      {t(`const.dealStage.${stage}`) || found?.label || stage || '-'}
    </span>
  );
}
