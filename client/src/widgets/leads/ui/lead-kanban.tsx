'use client';

import { useRouter } from 'next/navigation';
import { Phone, MessageSquare, Edit2 } from 'lucide-react';

import { useTranslation } from '@/shared/lib/i18n/context';
import { LEAD_SOURCES } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/format';
import type { Lead } from '@/entities/lead';
import { LeadAvatar } from '@/entities/lead';
import { useLeadKanbanUi } from '@/features/update-lead';

interface Props {
  leads: Lead[];
  loading: boolean;
  onEdit: (lead: Lead) => void;
  onStatusChange: (id: string, status: string) => void;
  onCall?: (phone: string) => void;
  onMessage?: (phone: string) => void;
  leadStatuses: Array<{ value: string; label: string; color?: string }>;
}

export function LeadKanban({ leads, loading, onEdit, onStatusChange, onCall, onMessage, leadStatuses }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { handleDragStart, handleDrop, byStatus } = useLeadKanbanUi(onStatusChange);

  const getNeedTypeLabel = (needType?: string | null) => {
    if (!needType) return '—';
    if (needType === 'buy') return t('leads.dialog.needBuy');
    if (needType === 'sell') return t('leads.dialog.needSell');
    if (needType === 'rent') return t('leads.dialog.needRent');
    return t(`const.needType.${needType}`) || needType;
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="w-72 h-96 bg-muted animate-pulse rounded-xl flex-shrink-0" />)}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {leadStatuses.map((status) => {
        const statusLeads = byStatus(leads, status.value);
        return (
          <div
            key={status.value}
            className="w-72 flex-shrink-0 bg-muted/30 rounded-xl p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status.value)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
              <h3 className="text-sm font-semibold">{status.label || t(`const.dealStage.${status.value}`) || status.value}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{statusLeads.length}</span>
            </div>

            <div className="space-y-2">
              {statusLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:shadow-md transition"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LeadAvatar firstName={lead.firstName} lastName={lead.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.firstName} {lead.lastName ?? ''}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>

                  {lead.assignedTo && <p className="text-xs text-muted-foreground mt-1 truncate">👤 {lead.assignedTo.name ?? '—'}</p>}

                  {lead.source && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(`const.leadSource.${lead.source}`) || LEAD_SOURCES.find((s) => s.value === lead.source)?.label || lead.source}
                    </p>
                  )}

                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] text-muted-foreground">{t('common.budget')}: {lead.budget != null ? lead.budget.toLocaleString() : '—'}</p>
                    <p className="text-[11px] text-muted-foreground">{t('leads.form.needType')}: {getNeedTypeLabel(lead.needType)}</p>
                    <p className="text-[11px] text-muted-foreground">{t('leads.lastContact')}: {lead.lastContact ? formatDate(lead.lastContact) : '—'}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                    <div className="flex gap-0.5">
                      {onCall && (
                        <button onClick={(e) => { e.stopPropagation(); onCall(lead.phone); }} className="p-1 hover:bg-green-50 rounded transition">
                          <Phone className="w-3 h-3 text-green-600" />
                        </button>
                      )}
                      {onMessage && (
                        <button onClick={(e) => { e.stopPropagation(); onMessage(lead.phone); }} className="p-1 hover:bg-blue-50 rounded transition">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onEdit(lead); }} className="p-1 hover:bg-muted rounded transition">
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {statusLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Порожньо</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}