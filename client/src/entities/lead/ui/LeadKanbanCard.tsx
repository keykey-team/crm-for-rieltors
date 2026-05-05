import { Edit2, MessageSquare, Phone } from 'lucide-react';
import { formatDate, getInitials } from '@/shared/lib/format';
import { setLeadDragData } from '@/entities/lead/lib/kanban';

interface LeadKanbanCardProps {
  lead: any;
  onEdit: (lead: any) => void;
  onCall?: (phone: string) => void;
  onMessage?: (phone: string) => void;
}

export function LeadKanbanCard({ lead, onEdit, onCall, onMessage }: LeadKanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(event) => setLeadDragData(event, lead.id)}
      className="bg-white rounded-xl p-3 border border-border cursor-grab active:cursor-grabbing hover:shadow-md transition"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
          {getInitials(`${lead.firstName} ${lead.lastName ?? ''}`)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {lead.firstName} {lead.lastName ?? ''}
          </p>
          <p className="text-xs text-muted-foreground">{lead.phone}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
        <div className="flex gap-0.5">
          {onCall && (
            <button onClick={(event) => { event.stopPropagation(); onCall(lead.phone); }} className="p-1 hover:bg-green-50 rounded transition">
              <Phone className="w-3 h-3 text-green-600" />
            </button>
          )}
          {onMessage && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onMessage(lead.phone);
              }}
              className="p-1 hover:bg-blue-50 rounded transition"
            >
              <MessageSquare className="w-3 h-3 text-blue-600" />
            </button>
          )}
          <button onClick={(event) => { event.stopPropagation(); onEdit(lead); }} className="p-1 hover:bg-muted rounded transition">
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
