'use client';

import { useEffect, useRef, useState } from 'react';

import { DEAL_STAGES } from '@/shared/lib/constants';
import { getFunnelStages } from '@/entities/settings';

export type FunnelStage = { value: string; label: string; color: string };

export function useFunnelBoardUi() {
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [stages, setStages] = useState<FunnelStage[]>(DEAL_STAGES as FunnelStage[]);
  const wasDragged = useRef(false);

  useEffect(() => {
    getFunnelStages().then((d) => {
      if (Array.isArray(d) && d.length > 0) setStages(d as FunnelStage[]);
    }).catch(() => {});
  }, []);

  return {
    dragItem,
    setDragItem,
    dragOver,
    setDragOver,
    stages,
    wasDragged,
  };
}
