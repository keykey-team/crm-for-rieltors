'use client';
import { useTranslation } from '@/lib/i18n/context';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEAL_STAGES } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { GripVertical, Edit2, Trash2, User, Building, ExternalLink } from 'lucide-react';

interface Props {
  deals: any[];
  loading: boolean;
  onStageChange: (dealId: string, newStage: string) => void;
  onEdit: (deal: any) => void;
  onDelete: (id: string) => void;
}

export function FunnelBoard({ deals, loading, onStageChange, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [stages, setStages] = useState(DEAL_STAGES);

  useEffect(() => {
    fetch('/api/funnel-stages')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setStages(d); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1,2,3,4].map((i) => <div key={i} className="min-w-[260px] h-64 bg-white rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
      {stages.map((stage: any) => {
        const stageDeals = (deals ?? []).filter((d: any) => d?.stage === stage.value);
        return (
          <div key={stage.value}
            className={`min-w-[260px] max-w-[260px] flex-shrink-0 rounded-2xl p-3 transition-all ${
              dragOver === stage.value ? 'ring-2 ring-primary/30 bg-primary/5' : 'bg-muted/40'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage.value); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(null);
              if (dragItem) onStageChange(dragItem, stage.value);
            }}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm font-medium truncate">{t(`const.dealStage.${stage.value}`) || stage.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{stageDeals.length}</span>
            </div>
            <div className="space-y-2">
              {stageDeals.map((deal: any) => (
                <div key={deal?.id} draggable
                  onDragStart={() => setDragItem(deal?.id)}
                  onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                  className="bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium leading-tight pr-2">{deal?.title}</p>
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  {deal?.amount && (
                    <p className="text-xs font-mono font-bold text-primary mb-2">{formatPrice(deal.amount)}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {deal?.lead && <span className="flex items-center gap-1"><User className="w-3 h-3" />{deal.lead.firstName}</span>}
                    {deal?.property && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{deal.property.title?.slice(0, 15)}</span>}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/deals/${deal?.id}`} className="p-1.5 rounded-lg hover:bg-primary/10"><ExternalLink className="w-3 h-3 text-primary" /></Link>
                    <button onClick={() => onEdit(deal)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => onDelete(deal?.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
