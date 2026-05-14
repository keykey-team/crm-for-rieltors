'use client';

import type { Lead } from '@/entities/lead';

export function useLeadKanbanUi(onStatusChange: (id: string, status: string) => void) {
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) onStatusChange(leadId, status);
  };

  const byStatus = (leads: Lead[], status: string) => leads.filter((lead) => lead.status === status);

  return {
    handleDragStart,
    handleDrop,
    byStatus,
  };
}
