'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import Link from 'next/link';
import { Edit2, Trash2, Phone, MessageSquare, Workflow, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/format';
import { getInitials } from '@/shared/lib/format';

interface Props {
  leads: any[];
  loading: boolean;
  onEdit: (lead: any) => void;
  onDelete: (id: string) => void;
  onCall?: (phone: string) => void;
  onMessage?: (phone: string) => void;
}

export function LeadTable({ leads, loading, onEdit, onDelete, onCall, onMessage }: Props) {
  const { t, locale } = useTranslation();
  if (loading) {
    return <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>;
  }
  if (leads.length === 0) {
    return <div className="text-center py-16 text-muted-foreground"><p>{t('leads.table.noLeads')}</p></div>;
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.name')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.phone')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.source')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.date')}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const status = LEAD_STATUSES.find(s => s.value === lead.status);
              const source = LEAD_SOURCES.find(s => s.value === lead.source);
              return (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {getInitials(`${lead.firstName} ${lead.lastName ?? ''}`)}
                      </div>
                      <div>
                        <p className="font-medium">{lead.firstName} {lead.lastName ?? ''}</p>
                        {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-md">{t(`const.leadSource.${lead.source}`) || source?.label || lead.source}</span></td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: status?.color + '20', color: status?.color }}>
                      {t(`const.leadStatus.${lead.status}`) || status?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/leads/${lead.id}`} className="p-1.5 hover:bg-primary/10 rounded-lg transition" title="Детальніше">
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                      </Link>
                      {onCall && (
                        <button onClick={() => onCall(lead.phone)} className="p-1.5 hover:bg-green-50 rounded-lg transition" title="Зателефонувати">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                        </button>
                      )}
                      {onMessage && (
                        <button onClick={() => onMessage(lead.phone)} className="p-1.5 hover:bg-blue-50 rounded-lg transition" title="Написати">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                      <button onClick={() => onEdit(lead)} className="p-1.5 hover:bg-muted rounded-lg transition">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => onDelete(lead.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
