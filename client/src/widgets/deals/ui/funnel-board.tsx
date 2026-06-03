'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GripVertical, Edit2, Trash2, User, Building, ExternalLink, Workflow } from 'lucide-react';

import { useTranslation } from '@/shared/lib/i18n/context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import type { Deal } from '@/entities/deal';
import type { Funnel, FunnelStage } from '@/entities/settings';
import { formatPrice, getInitials } from '@/shared/lib/format';
import { useFunnelBoardUi } from '@/features/update-deal-stage';

interface Props {
  loading: boolean;
  stages: FunnelStage[];
  funnels: Funnel[];
  selectedFunnelId: string | null;
  stageDeals: Record<string, Deal[]>;
  stageTotals: Record<string, number>;
  stageHasMore: Record<string, boolean>;
  loadingMoreStages: Record<string, boolean>;
  onLoadMoreStage: (stage: string) => void;
  onStageChange: (dealId: string, newStage: string) => void;
  onFunnelChange: (dealId: string, funnelId: string) => void | Promise<void>;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

export function FunnelBoard({ loading, stages, funnels, selectedFunnelId, stageDeals, stageTotals, stageHasMore, loadingMoreStages, onLoadMoreStage, onStageChange, onFunnelChange, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { dragItem, setDragItem, dragOver, setDragOver, wasDragged } = useFunnelBoardUi();
  const [moveMenuDealId, setMoveMenuDealId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex gap-4 overflow-x-auto pb-4">{[1, 2, 3, 4].map((i) => <div key={i} className="min-w-[260px] h-64 bg-card rounded-2xl animate-pulse" />)}</div>;
  }

  if (!selectedFunnelId || stages.length === 0) {
    return <div className="rounded-2xl border border-border/50 bg-card p-8 text-center text-sm text-muted-foreground">{t('deals.noFunnelsAvailable')}</div>;
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x-mandatory items-start" style={{ minHeight: '60vh' }}>
      {stages.map((stage) => {
        const items = stageDeals[stage.value] ?? [];
        const translated = t(`const.dealStage.${stage.value}`);
        const stageLabel = translated && !translated.startsWith('const.') ? translated : stage.label || stage.value;
        const totalCount = stageTotals[stage.value] ?? items.length;

        return (
          <div
            key={stage.value}
            className={`min-w-[75vw] sm:min-w-[240px] w-[260px] max-h-[70vh] flex-shrink-0 rounded-2xl p-3 transition-all border ${dragOver === stage.value ? 'ring-2 ring-primary/30 bg-primary/5 border-primary/20' : 'bg-muted/30 dark:bg-muted/15 border-border/40 dark:border-border/30'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage.value); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              if (dragItem) onStageChange(dragItem, stage.value);
            }}
          >
            <div className="mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="min-w-0 flex-1 text-sm font-medium truncate cursor-default" title={stageLabel}>{stageLabel}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-72 whitespace-normal">{stageLabel}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-xs text-muted-foreground ml-auto bg-muted px-1.5 py-0.5 rounded-md">{totalCount}</span>
              </div>
              {items.length > 0 && (() => {
                const byCurrency: Record<string, number> = {};
                items.forEach((d) => {
                  const currency = d.currency || 'USD';
                  byCurrency[currency] = (byCurrency[currency] || 0) + (d.amount ?? 0);
                });
                const entries = Object.entries(byCurrency).filter(([, value]) => value > 0);
                return entries.length > 0 ? <p className="text-[11px] font-mono font-semibold text-muted-foreground mt-1 pl-5">{entries.map(([currency, value]) => formatPrice(value, currency)).join(' · ')}</p> : null;
              })()}
            </div>

            <div
              className="space-y-2 max-h-[calc(70vh-5rem)] overflow-y-auto pr-1"
              onScroll={(event) => {
                const target = event.currentTarget;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 120 && stageHasMore[stage.value] && !loadingMoreStages[stage.value]) {
                  onLoadMoreStage(stage.value);
                }
              }}
            >
              {items.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => { setDragItem(deal.id); wasDragged.current = true; }}
                  onDragEnd={() => { setDragItem(null); setDragOver(null); setTimeout(() => { wasDragged.current = false; }, 100); }}
                  onClick={() => { if (!wasDragged.current) router.push(`/deals/${deal.id}`); }}
                  className="bg-card rounded-2xl p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-border/60 dark:border-border/40"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium leading-tight pr-2">{deal.title}</p>
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  {deal.amount && <p className="text-xs font-mono font-bold text-primary mb-2">{formatPrice(deal.amount, deal.currency || 'USD')}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {deal.lead && <span className="flex items-center gap-1"><User className="w-3 h-3" />{deal.lead.firstName}</span>}
                    {deal.property && <span className="flex items-center gap-1 truncate"><Building className="w-3 h-3" />{deal.property.title?.slice(0, 15)}</span>}
                  </div>
                  {deal.assignedTo && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {deal.assignedTo.avatar ? (
                        <img src={deal.assignedTo.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#073B34]/10 dark:bg-emerald-900/30 flex items-center justify-center text-[8px] font-bold text-[#073B34] dark:text-emerald-400 flex-shrink-0">
                          {getInitials(deal.assignedTo.name ?? '')}
                        </div>
                      )}
                      <span className="text-[11px] text-muted-foreground truncate">{deal.assignedTo.name}</span>
                    </div>
                  )}
                  {(() => {
                    const idx = stages.findIndex((s) => s.value === stage.value);
                    const progress = stages.length > 1 ? Math.round(((idx + 1) / stages.length) * 100) : 100;
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: stage.color }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{progress}%</span>
                      </div>
                    );
                  })()}
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {funnels.length > 1 ? (
                      <div className="relative">
                        <button onClick={() => setMoveMenuDealId((prev) => prev === deal.id ? null : deal.id)} className="p-1.5 rounded-lg hover:bg-muted" title={t('deals.moveToFunnel')}>
                          <Workflow className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {moveMenuDealId === deal.id ? (
                          <div className="absolute right-0 bottom-full mb-1 w-52 rounded-xl border border-border bg-card p-1 shadow-lg z-20">
                            {funnels.filter((funnel) => funnel.id !== deal.funnelId).map((funnel) => (
                              <button
                                key={funnel.id}
                                onClick={async () => {
                                  await onFunnelChange(deal.id, funnel.id);
                                  setMoveMenuDealId(null);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted/60 transition"
                              >
                                {funnel.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <Link href={`/deals/${deal.id}`} className="p-1.5 rounded-lg hover:bg-primary/10"><ExternalLink className="w-3 h-3 text-primary" /></Link>
                    <button onClick={() => onEdit(deal)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => onDelete(deal.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                  </div>
                </div>
              ))}
              {loadingMoreStages[stage.value] ? <div className="rounded-2xl border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">{t('common.loading')}</div> : null}
              {!loadingMoreStages[stage.value] && stageHasMore[stage.value] ? <div className="h-8" /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
