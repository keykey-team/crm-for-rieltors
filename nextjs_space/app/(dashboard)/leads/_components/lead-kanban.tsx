'use client';
import { useTranslation } from '@/lib/i18n/context';
import { Phone, MessageSquare, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEAD_STATUSES } from '@/lib/constants';
import { getInitials, formatDate } from '@/lib/format';

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
        {[1,2,3,4].map(i => <div key={i} className="w-72 h-96 bg-muted animate-pulse rounded-xl flex-shrink-0" />)}
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) onStatusChange(leadId, status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STATUSES.map(status => {
        const statusLeads = leads.filter(l => l.status === status.value);
        return (
          <div key={status.value}
            className="w-72 flex-shrink-0 bg-muted/30 rounded-xl p-3"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, status.value)}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
              <h3 className="text-sm font-semibold">{t(`const.leadStatus.${status.value}`) || status.label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{statusLeads.length}</span>
            </div>
            <div className="space-y-2">
              {statusLeads.map(lead => (
                <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)}
                  className="bg-white rounded-xl p-3 border border-border cursor-grab active:cursor-grabbing hover:shadow-md transition"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {getInitials(`${lead.firstName} ${lead.lastName ?? ''}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.firstName} {lead.lastName ?? ''}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                    <div className="flex gap-0.5">
                      {onCall && (
                        <button onClick={e => { e.stopPropagation(); onCall(lead.phone); }}
                          className="p-1 hover:bg-green-50 rounded transition">
                          <Phone className="w-3 h-3 text-green-600" />
                        </button>
                      )}
                      {onMessage && (
                        <button onClick={e => { e.stopPropagation(); onMessage(lead.phone); }}
                          className="p-1 hover:bg-blue-50 rounded transition">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); onEdit(lead); }}
                        className="p-1 hover:bg-muted rounded transition">
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
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
