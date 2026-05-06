'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { LEAD_STATUSES } from '@/shared/lib/constants';
import { getLeadIdFromDrop, getStatusLeads } from '@/entities/lead/lib/kanban';
import { LeadKanbanCard } from './LeadKanbanCard';

interface Props {
  leads: any[];
  loading: boolean;
  onEdit: (lead: any) => void;
  onStatusChange: (id: string, status: string) => void;
  onCall?: (phone: string) => void;
  onMessage?: (phone: string) => void;
}

export function LeadKanban({ leads, loading, onEdit, onStatusChange, onCall, onMessage }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="w-72 h-96 bg-muted animate-pulse rounded-xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  const handleDrop = (event: React.DragEvent, status: string) => {
    const leadId = getLeadIdFromDrop(event);
    if (leadId) {
      onStatusChange(leadId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STATUSES.map((status) => {
        const statusLeads = getStatusLeads(leads, status.value);

        return (
          <div
            key={status.value}
            className="w-72 flex-shrink-0 bg-muted/30 rounded-xl p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, status.value)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
              <h3 className="text-sm font-semibold">{t(`const.leadStatus.${status.value}`) || status.label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{statusLeads.length}</span>
            </div>

            <div className="space-y-2">
              {statusLeads.map((lead) => (
                <LeadKanbanCard key={lead.id} lead={lead} onEdit={onEdit} onCall={onCall} onMessage={onMessage} />
              ))}

              {statusLeads.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Порожньо</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
