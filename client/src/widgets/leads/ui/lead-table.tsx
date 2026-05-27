'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Phone, MessageSquare, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { LEAD_SOURCES } from '@/shared/lib/constants';
import type { Lead } from '@/entities/lead';
import type { User } from '@/entities/user';
import { LeadAvatar } from '@/entities/lead';
import { formatDate, formatPrice, getInitials } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/empty-state';
import { DatePicker } from '@/shared/ui';
import { useLeadTableUi } from '@/features/update-lead';

interface Props {
  leads: Lead[];
  loading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onCall?: (phone: string) => void;
  onMessage?: (phone: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onSourceChange?: (id: string, source: string) => void;
  onManagerChange?: (id: string, managerId: string | null) => void;
  onLastContactChange?: (id: string, lastContact: string | null) => void;
  managers?: User[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (col: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  leadStatuses: Array<{ value: string; label: string; color?: string }>;
}

function toDateInputValue(dateLike?: string | null) {
  if (!dateLike) return '';
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function LeadTable({ leads, loading, onEdit, onDelete, onCall, onMessage, onStatusChange, onSourceChange, onManagerChange, onLastContactChange, managers = [], sortBy, sortDir, onSort, selectedIds, onToggleSelect, onToggleAll, leadStatuses }: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { activeDropdown, setActiveDropdown, toggleDropdown, sortedLeads } = useLeadTableUi(leads, sortBy, sortDir);

  const getNeedTypeLabel = (needType?: string | null) => {
    if (!needType) return '—';
    if (needType === 'buy') return t('leads.dialog.needBuy');
    if (needType === 'sell') return t('leads.dialog.needSell');
    if (needType === 'rent') return t('leads.dialog.needRent');
    return t(`const.needType.${needType}`) || needType;
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 ml-1" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-primary ml-1" /> : <ArrowDown className="w-3 h-3 text-primary ml-1" />;
  };
  if (loading) {
    return <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>;
  }
  if (leads.length === 0) {
    return <EmptyState icon={Users} title={t('leads.table.noLeads')} description={t('empty.leadsHint')} />;
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-3 py-3">
                <input type="checkbox" checked={leads.length > 0 && selectedIds.size === leads.length} onChange={onToggleAll}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition" onClick={() => onSort?.('name')}>
                <span className="inline-flex items-center">{t('common.name')}<SortIcon col="name" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.phone')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.budget')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('leads.form.needType')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition" onClick={() => onSort?.('source')}>
                <span className="inline-flex items-center">{t('common.source')}<SortIcon col="source" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition" onClick={() => onSort?.('status')}>
                <span className="inline-flex items-center">{t('common.status')}<SortIcon col="status" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('leads.lastContact')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition" onClick={() => onSort?.('manager')}>
                <span className="inline-flex items-center">{t('common.manager')}<SortIcon col="manager" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition" onClick={() => onSort?.('createdAt')}>
                <span className="inline-flex items-center">{t('common.date')}<SortIcon col="createdAt" /></span>
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map(lead => {
              const status = leadStatuses.find((item) => item.value === lead.status);
              return (
                <tr key={lead.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20 transition cursor-pointer group/row", selectedIds.has(lead.id) && "bg-primary/5")} onClick={() => router.push(`/leads/${lead.id}`)}>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => onToggleSelect(lead.id)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <LeadAvatar firstName={lead.firstName} lastName={lead.lastName} />
                      <div>
                        <p className="font-medium">{lead.firstName} {lead.lastName ?? ''}</p>
                        {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{formatPrice(lead.budget, 'USD', locale)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{getNeedTypeLabel(lead.needType)}</td>
                  {/* Source dropdown */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div data-inline-dropdown>
                      <button onClick={(e) => toggleDropdown(lead.id, 'source', e.currentTarget.getBoundingClientRect())}
                        className="text-xs bg-muted px-2 py-0.5 rounded-md cursor-pointer hover:ring-2 hover:ring-primary/20 transition">
                        {t(`const.leadSource.${lead.source}`) || LEAD_SOURCES.find(s => s.value === lead.source)?.label || lead.source}
                      </button>
                      {activeDropdown?.id === lead.id && activeDropdown?.type === 'source' && onSourceChange && (
                        <div data-inline-dropdown className="fixed bg-card border border-border rounded-xl py-1 z-50 min-w-[140px] max-h-48 overflow-y-auto"
                          style={{ top: activeDropdown.rect.bottom + 4, left: activeDropdown.rect.left, boxShadow: 'var(--shadow-lg)' }}>
                          {LEAD_SOURCES.map(s => (
                            <button key={s.value} onClick={() => { onSourceChange(lead.id, s.value); setActiveDropdown(null); }}
                              className={cn('w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted transition',
                                lead.source === s.value && 'font-semibold')}>
                              {t(`const.leadSource.${s.value}`) || s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Status dropdown */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div data-inline-dropdown>
                      <button onClick={(e) => toggleDropdown(lead.id, 'status', e.currentTarget.getBoundingClientRect())}
                        className="text-xs px-2 py-0.5 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20 transition"
                        style={{ backgroundColor: status?.color + '20', color: status?.color }}>
                        {status?.label || t(`const.dealStage.${lead.status}`) || lead.status}
                      </button>
                      {activeDropdown?.id === lead.id && activeDropdown?.type === 'status' && onStatusChange && (
                        <div data-inline-dropdown className="fixed bg-card border border-border rounded-xl py-1 z-50 min-w-[140px] max-h-48 overflow-y-auto"
                          style={{ top: activeDropdown.rect.bottom + 4, left: activeDropdown.rect.left, boxShadow: 'var(--shadow-lg)' }}>
                          {leadStatuses.map(s => (
                            <button key={s.value} onClick={() => { onStatusChange(lead.id, s.value); setActiveDropdown(null); }}
                              className={cn('w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted transition',
                                lead.status === s.value && 'font-semibold')}>
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                              {s.label || t(`const.dealStage.${s.value}`) || s.value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" onClick={e => e.stopPropagation()}>
                    {onLastContactChange ? (
                      <div className="min-w-[160px] max-w-[180px]" data-inline-dropdown>
                        <DatePicker
                          value={toDateInputValue(lead.lastContact)}
                          onChange={(value: string) => onLastContactChange(lead.id, value || null)}
                        />
                      </div>
                    ) : (
                      lead.lastContact ? formatDate(lead.lastContact) : '—'
                    )}
                  </td>
                  {/* Manager dropdown */}
                  <td className="px-4 py-3 text-sm" onClick={e => e.stopPropagation()}>
                    <div data-inline-dropdown>
                      <button onClick={(e) => toggleDropdown(lead.id, 'manager', e.currentTarget.getBoundingClientRect())} className="flex items-center gap-2 cursor-pointer hover:ring-2 hover:ring-primary/20 rounded-lg px-1.5 py-0.5 -mx-1.5 transition">
                        {lead.assignedTo ? (
                          <>
                            {lead.assignedTo.avatar ? (
                              <img src={lead.assignedTo.avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                {getInitials(lead.assignedTo.name ?? '')}
                              </div>
                            )}
                            <span className="text-foreground truncate text-xs">{lead.assignedTo.name ?? '—'}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </button>
                      {activeDropdown?.id === lead.id && activeDropdown?.type === 'manager' && onManagerChange && (
                        <div data-inline-dropdown className="fixed bg-card border border-border rounded-xl py-1 z-50 min-w-[160px] max-h-48 overflow-y-auto"
                          style={{ top: activeDropdown.rect.bottom + 4, left: activeDropdown.rect.left, boxShadow: 'var(--shadow-lg)' }}>
                          <button onClick={() => { onManagerChange(lead.id, null); setActiveDropdown(null); }}
                            className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition text-muted-foreground',
                              !lead.assignedToId && 'font-semibold')}>
                            — {t('leads.noManager')}
                          </button>
                          {managers.map(m => (
                            <button key={m.id} onClick={() => { onManagerChange(lead.id, m.id); setActiveDropdown(null); }}
                              className={cn('w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted transition',
                                lead.assignedToId === m.id && 'font-semibold')}>
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0">
                                {getInitials(m.name ?? '')}
                              </div>
                              {m.name || m.email}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/leads/${lead.id}`} title={t('common.open')}
                        className="h-8 w-8 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-primary/10 transition shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                      </Link>
                      {onCall && lead.phone && (
                        <button onClick={() => onCall(lead.phone)} title={t('leads.quickCall')}
                          className="h-8 w-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition shadow-sm">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onMessage && lead.phone && (
                        <button onClick={() => onMessage(lead.phone)} title={t('leads.quickMsg')}
                          className="h-8 w-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition shadow-sm">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => onEdit(lead)} title={t('common.edit')}
                        className="h-8 w-8 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-muted transition shadow-sm">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => onDelete(lead.id)} title={t('common.delete')}
                        className="h-8 w-8 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-destructive/10 transition shadow-sm">
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
