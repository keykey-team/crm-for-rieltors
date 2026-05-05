export function getStatusLeads(leads: any[], status: string) {
  return (leads ?? []).filter((lead) => lead.status === status);
}

export function setLeadDragData(event: React.DragEvent, leadId: string) {
  event.dataTransfer.setData('leadId', leadId);
}

export function getLeadIdFromDrop(event: React.DragEvent) {
  event.preventDefault();
  return event.dataTransfer.getData('leadId');
}
