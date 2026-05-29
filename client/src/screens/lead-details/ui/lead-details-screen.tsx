'use client';
import { useState, useEffect, useCallback } from 'react';
import { Phone, MessageSquare, Mail, Plus, Send, Clock, Workflow, FileText, User } from 'lucide-react';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/shared/lib/constants';
import { normalizeStageValue, resolveDealStageLabel } from '@/shared/lib/funnel-stages';
import { formatDate, formatDateTime, formatPrice, getInitials } from '@/shared/lib/format';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { getLeadCommunications, createLeadCommunication } from '@/entities/communication';
import { getLeadById, createDealFromLead } from '@/entities/lead/api/lead-detail.api';
import { LeadMatches } from '@/widgets/lead-matches';

const COMM_TYPES_RAW = [
  { value: 'note', labelKey: 'const.commType.note', icon: FileText, color: 'text-gray-500' },
  { value: 'call', labelKey: 'const.commType.call', icon: Phone, color: 'text-green-500' },
  { value: 'message', labelKey: 'const.commType.message', icon: MessageSquare, color: 'text-blue-500' },
  { value: 'email', labelKey: 'const.commType.email', icon: Mail, color: 'text-purple-500' },
  { value: 'meeting', labelKey: 'const.commType.meeting', icon: User, color: 'text-orange-500' },
];

export function LeadDetailClient({ leadId }: { leadId: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const COMM_TYPES = COMM_TYPES_RAW.map(ct => ({ ...ct, label: t(ct.labelKey) }));
  const [lead, setLead] = useState<any>(null);
  const [comms, setComms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComm, setNewComm] = useState('');
  const [commType, setCommType] = useState('note');
  const [commDirection, setCommDirection] = useState('outgoing');
  const [creatingDeal, setCreatingDeal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [leadData, commData] = await Promise.all([
        getLeadById(leadId),
        getLeadCommunications(leadId),
      ]);
      setLead(leadData);
      setComms(commData);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addComm = async () => {
    if (!newComm.trim()) return;
    await createLeadCommunication({ leadId, type: commType, direction: commDirection, content: newComm });
    setNewComm('');
    fetchData();
    toast.success(t('leads.addedComm'));
  };

  const handleCreateDeal = async () => {
    setCreatingDeal(true);
    try {
      const deal = await createDealFromLead(leadId);
      toast.success(t('leads.dealCreated'));
      router.push(`/deals/${deal.id}`);
    } catch { toast.error(t('leads.error')); }
    setCreatingDeal(false);
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;
  if (!lead) return <div className="text-center py-16 text-muted-foreground">{t('leads.notFound')}</div>;

  const status = LEAD_STATUSES.find(s => s.value === normalizeStageValue(lead.status));

  return (
    <div>
      <Breadcrumbs items={[
        { label: t('leads.title'), href: '/leads' },
        { label: lead ? `${lead.firstName} ${lead.lastName ?? ''}`.trim() : '...' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                {getInitials(`${lead.firstName} ${lead.lastName ?? ''}`)}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{lead.firstName} {lead.lastName ?? ''}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (status?.color || '#999') + '20', color: status?.color }}>
                  {resolveDealStageLabel({ value: lead.status, label: status?.label }, t)}
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{lead.phone}</span></div>
              {lead.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{lead.email}</span></div>}
              {lead.assignedTo && <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">{t('common.manager')}:</span><span className="font-medium">{lead.assignedTo.name ?? lead.assignedTo.email ?? '—'}</span></div>}
              {lead.source && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('common.source')}:</span><span>{t(`const.leadSource.${lead.source}`) || LEAD_SOURCES.find(s => s.value === lead.source)?.label || lead.source}</span></div>}
              {lead.needType && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('common.needType')}:</span><span>{t(`const.needType.${lead.needType}`) || lead.needType}</span></div>}
              {lead.priority && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('common.priority')}:</span><span>{t(`const.priority.${lead.priority}`) || lead.priority}</span></div>}
              {lead.budget && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('leads.budget')}:</span><span className="font-mono font-bold">{formatPrice(lead.budget, 'USD', locale)}</span></div>}
              <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('leads.lastContact')}:</span><span>{lead.lastContact ? formatDate(lead.lastContact, locale) : '—'}</span></div>
              {lead.districts && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('leads.districtLabel')}:</span><span>{lead.districts}</span></div>}
              {lead.propertyType && <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('leads.typeLabel')}:</span><span>{t(`const.propertyType.${lead.propertyType}`) || lead.propertyType}</span></div>}
              {lead.notes && <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">{lead.notes}</div>}
              <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> {t('leads.createdDate')}: {formatDate(lead.createdAt, locale)}</div>
            </div>
          </div>

          <button onClick={handleCreateDeal} disabled={creatingDeal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
            <Workflow className="w-4 h-4" /> {creatingDeal ? t('common.saving') : t('leads.createDeal')}
          </button>

          <LeadMatches leadId={leadId} />

          {lead.deals?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-semibold mb-2">{t('leads.relatedDeals')}</h3>
              {lead.deals.map((d: any) => (
                <Link key={d.id} href={`/deals/${d.id}`} className="block p-2 hover:bg-muted/50 rounded-lg transition text-sm">
                  <span className="font-medium">{d.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{(() => { const _t = t(`const.dealStage.${d.stage}`); return _t && !_t.startsWith('const.') ? _t : d.stage; })()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-lg">{t('leads.commHistory')}</h2>
            </div>

            <div className="p-4 border-b border-border space-y-3">
              <div className="flex gap-2">
                {COMM_TYPES.map(ct => (
                  <button key={ct.value} onClick={() => setCommType(ct.value)}
                    className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition',
                      commType === ct.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground')}>
                    <ct.icon className="w-3 h-3" /> {ct.label}
                  </button>
                ))}
              </div>
              {commType !== 'note' && (
                <div className="flex gap-2">
                  <button onClick={() => setCommDirection('outgoing')}
                    className={cn('px-3 py-1 rounded-lg text-xs', commDirection === 'outgoing' ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground')}>
                    {t('leads.outgoing')}
                  </button>
                  <button onClick={() => setCommDirection('incoming')}
                    className={cn('px-3 py-1 rounded-lg text-xs', commDirection === 'incoming' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground')}>
                    {t('leads.incoming')}
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <textarea value={newComm} onChange={e => setNewComm(e.target.value)} rows={2} placeholder={t('leads.addEntry')}
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <button onClick={addComm} className="self-end p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {comms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('leads.noEntries')}</p>
              ) : (
                <div className="space-y-4">
                  {comms.map(comm => {
                    const ct = COMM_TYPES.find(ct2 => ct2.value === comm.type) || COMM_TYPES[0];
                    const Icon = ct.icon;
                    return (
                      <div key={comm.id} className="flex gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          comm.direction === 'incoming' ? 'bg-green-50' : 'bg-blue-50')}>
                          <Icon className={cn('w-4 h-4', ct.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{ct.label}</span>
                            {comm.direction && <span className={cn('text-xs px-1.5 py-0.5 rounded',
                              comm.direction === 'incoming' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600')}>
                              {comm.direction === 'incoming' ? t('leads.incoming') : t('leads.outgoing')}
                            </span>}
                            <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(comm.createdAt, locale)}</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{comm.content}</p>
                          {comm.user?.name && <p className="text-xs text-muted-foreground mt-1">— {comm.user.name}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
