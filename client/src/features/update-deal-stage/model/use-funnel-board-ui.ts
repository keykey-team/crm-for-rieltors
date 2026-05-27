'use client';

import { useRef, useState } from 'react';

export function useFunnelBoardUi() {
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const wasDragged = useRef(false);

  return {
    dragItem,
    setDragItem,
    dragOver,
    setDragOver,
    wasDragged,
  };
}
