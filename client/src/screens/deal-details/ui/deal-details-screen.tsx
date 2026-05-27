'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { User, Building, CheckSquare, MessageSquare, Clock, Plus, Send, Edit2, Trash2, Settings, Search, X, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { DEAL_STAGES } from '@/shared/lib/constants';
import { formatPrice, formatDate, formatDateTime, getInitials } from '@/shared/lib/format';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { getUsers } from '@/entities/user';
import { getLeads, createLead } from '@/entities/lead';
import { getProperties, createProperty } from '@/entities/property';
import {
  createDealChecklistItem,
  createDealComment,
  getDealById,
  getDealChecklist,
  getDealComments,
  getDealCustomFieldValues,
  updateDealById,
  updateDealChecklistItem,
  upsertDealCustomFieldValue,
} from '@/entities/deal';
import { getActivityLog } from '@/entities/activity-log';
import { getDealCustomFields, getFunnelStages } from '@/entities/settings';
import { getExchangeRate } from '@/shared/api/exchange-rate';

export function DealDetailClient({ dealId }: { dealId: string }) {
  const { t, locale } = useTranslation();
  const [deal, setDeal] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIdx, setMentionIdx] = useState(0);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'checklist' | 'history' | 'customFields'>('comments');
  const [stages, setStages] = useState(DEAL_STAGES);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [cfValues, setCfValues] = useState<Record<string, string>>({});

  // Lead & Property picker state
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const leadPickerRef = useRef<HTMLDivElement>(null);
  const propPickerRef = useRef<HTMLDivElement>(null);

  // Finances inline editing
  const [editingFinances, setEditingFinances] = useState(false);
  const [financeForm, setFinanceForm] = useState({ amount: '', commission: '', currency: 'USD' });
  const [nbuRate, setNbuRate] = useState<{ rate: number; date: string } | null>(null);

  // Fetch NBU exchange rate
  useEffect(() => {
    getExchangeRate().then((d) => {
      if (d?.rate) setNbuRate({ rate: d.rate, date: d.date });
    }).catch(() => {});
  }, []);

  // Inline creation forms
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [creatingLead, setCreatingLead] = useState(false);
  const [showNewPropForm, setShowNewPropForm] = useState(false);
  const [newPropForm, setNewPropForm] = useState({ title: '', address: '' });
  const [creatingProp, setCreatingProp] = useState(false);

  // Fetch leads & properties for pickers
  const refreshPickerData = useCallback(() => {
    getLeads().then(setAllLeads).catch(() => {});
    getProperties().then(setAllProperties).catch(() => {});
  }, []);

  useEffect(() => { refreshPickerData(); }, [refreshPickerData]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (leadPickerRef.current && !leadPickerRef.current.contains(e.target as Node)) { setShowLeadPicker(false); setShowNewLeadForm(false); }
      if (propPickerRef.current && !propPickerRef.current.contains(e.target as Node)) { setShowPropertyPicker(false); setShowNewPropForm(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const createLeadAndAssign = async () => {
    if (!newLeadForm.firstName.trim() || !newLeadForm.phone.trim()) return;
    setCreatingLead(true);
    try {
      const lead = await createLead({
        firstName: newLeadForm.firstName.trim(),
        lastName: newLeadForm.lastName.trim() || undefined,
        phone: newLeadForm.phone.trim(),
        email: newLeadForm.email.trim() || undefined,
        source: 'manual',
      });
      if (lead?.id) {
        await updateDealField('leadId', lead.id);
        refreshPickerData();
        setShowLeadPicker(false);
        setShowNewLeadForm(false);
        setNewLeadForm({ firstName: '', lastName: '', phone: '', email: '' });
      } else { toast.error(t('common.error')); }
    } catch { toast.error(t('common.error')); }
    finally { setCreatingLead(false); }
  };

  const createPropertyAndAssign = async () => {
    if (!newPropForm.title.trim()) return;
    setCreatingProp(true);
    try {
      const prop = await createProperty({
        title: newPropForm.title.trim(),
        address: newPropForm.address.trim() || undefined,
      });
      if (prop?.id) {
        await updateDealField('propertyId', prop.id);
        refreshPickerData();
        setShowPropertyPicker(false);
        setShowNewPropForm(false);
        setNewPropForm({ title: '', address: '' });
      } else { toast.error(t('common.error')); }
    } catch { toast.error(t('common.error')); }
    finally { setCreatingProp(false); }
  };

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return allLeads;
    const q = leadSearch.toLowerCase();
    return allLeads.filter((l: any) =>
      `${l.firstName} ${l.lastName ?? ''}`.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    );
  }, [allLeads, leadSearch]);

  const filteredProperties = useMemo(() => {
    if (!propSearch) return allProperties;
    const q = propSearch.toLowerCase();
    return allProperties.filter((p: any) =>
      p.title?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  }, [allProperties, propSearch]);

  const updateDealField = async (field: string, value: string | null) => {
    await updateDealById(dealId, { [field]: value });
    toast.success(t('deals.saved'));
    fetchDeal();
  };

  const fetchDeal = useCallback(async () => {
    try {
      const [dealData, commData, checkData, logData, stagesData, cfData, cfvData] = await Promise.all([
        getDealById(dealId),
        getDealComments(dealId),
        getDealChecklist(dealId),
        getActivityLog('deal', dealId),
        getFunnelStages(),
        getDealCustomFields(),
        getDealCustomFieldValues(dealId),
      ]);
      setDeal(dealData);
      setComments(Array.isArray(commData) ? commData : []);
      setChecklist(Array.isArray(checkData) ? checkData : []);
      setLogs(Array.isArray(logData) ? logData : []);
      if (Array.isArray(stagesData) && stagesData.length > 0) setStages(stagesData);
      if (Array.isArray(cfData)) setCustomFields(cfData);
      if (Array.isArray(cfvData)) {
        const vals: Record<string, string> = {};
        cfvData.forEach((v: any) => { vals[v.fieldId] = v.value; });
        setCfValues(vals);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [dealId]);

  useEffect(() => { fetchDeal(); }, [fetchDeal]);
  useEffect(() => {
    getUsers().then(setTeamUsers).catch(() => {});
  }, []);

  const filteredMentionUsers = useMemo(() => {
    if (!mentionQuery) return teamUsers;
    const q = mentionQuery.toLowerCase();
    return teamUsers.filter((u: any) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  }, [teamUsers, mentionQuery]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setNewComment(v);
    const pos = e.target.selectionStart ?? v.length;
    const before = v.slice(0, pos);
    const atMatch = before.match(/@([\p{L}\p{N}_]*)$/u);
    if (atMatch) { setShowMentions(true); setMentionQuery(atMatch[1]); setMentionIdx(0); }
    else { setShowMentions(false); }
  };

  const insertCommentMention = (user: any) => {
    const pos = commentInputRef.current?.selectionStart ?? newComment.length;
    const before = newComment.slice(0, pos);
    const after = newComment.slice(pos);
    const atIdx = before.lastIndexOf('@');
    setNewComment(before.slice(0, atIdx) + `@${user.name} ` + after);
    setShowMentions(false);
    setTimeout(() => commentInputRef.current?.focus(), 50);
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMentionUsers.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, filteredMentionUsers.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertCommentMention(filteredMentionUsers[mentionIdx]); return; }
      if (e.key === 'Escape') { setShowMentions(false); return; }
    }
    if (e.key === 'Enter' && !showMentions) addComment();
  };

  const renderCommentText = (text: string) => {
    const parts = text.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        const found = teamUsers.find((u: any) => u.name === name);
        if (found) return <span key={i} className="bg-primary/15 text-primary font-medium px-0.5 rounded">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    await createDealComment(dealId, newComment);
    setNewComment('');
    fetchDeal();
  };

  const addCheckItem = async () => {
    if (!newCheckItem.trim()) return;
    await createDealChecklistItem(dealId, newCheckItem, checklist.length);
    setNewCheckItem('');
    fetchDeal();
  };

  const toggleCheckItem = async (itemId: string, completed: boolean) => {
    await updateDealChecklistItem(dealId, itemId, !completed);
    fetchDeal();
  };

  const changeStage = async (stage: string) => {
    await updateDealById(dealId, { stage });
    toast.success(t('deals.stageUpdated'));
    fetchDeal();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t('deals.dealNotFound')}</p>
        <Link href="/deals" className="text-primary text-sm mt-2 inline-block">← {t('common.back')}</Link>
      </div>
    );
  }

  const completedItems = checklist.filter(c => c.completed).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t('deals.title'), href: '/deals' },
        { label: deal.title },
      ]} />
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">{deal.title}</h1>
          <p className="text-sm text-muted-foreground">{t('deals.createdDate')} {formatDate(deal.createdAt, locale)}</p>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-sm font-semibold mb-3">{t('deals.dealStage')}</h2>
        <div className="flex flex-wrap gap-1.5">
          {stages.filter(s => s.value !== 'rejected').map(stage => (
            <button key={stage.value} onClick={() => changeStage(stage.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                deal.stage === stage.value
                  ? 'text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
              style={deal.stage === stage.value ? { backgroundColor: stage.color } : undefined}>
              {(() => { const _t = t(`const.dealStage.${stage.value}`); return _t && !_t.startsWith('const.') ? _t : stage.label; })()}
            </button>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── Contact (Lead) picker ── */}
        <div ref={leadPickerRef} className="bg-card rounded-xl border border-border p-4 relative" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="w-4 h-4 text-blue-500" /> {t('deals.contact')}
            </div>
            <button
              onClick={() => { setShowLeadPicker(!showLeadPicker); setLeadSearch(''); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {deal.lead ? <><Edit2 className="w-3 h-3" /> {t('common.edit')}</> : <><Plus className="w-3 h-3" /> {t('deals.dialog.selectLead')}</>}
            </button>
          </div>
          {deal.lead ? (
            <div className="flex items-center justify-between">
              <Link href={`/leads/${deal.lead.id}`} className="hover:underline">
                <p className="text-sm font-medium">{deal.lead.firstName} {deal.lead.lastName ?? ''}</p>
                <p className="text-xs text-muted-foreground">{deal.lead.phone}</p>
                <p className="text-xs text-muted-foreground">{deal.lead.email ?? ''}</p>
              </Link>
              <button onClick={() => updateDealField('leadId', null)} className="text-muted-foreground hover:text-destructive p-1" title={t('common.delete')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : <p className="text-xs text-muted-foreground">{t('deals.notAssigned')}</p>}

          {showLeadPicker && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
              {!showNewLeadForm ? (
                <>
                  <div className="flex items-center gap-2 p-2 border-b border-border">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      autoFocus
                      value={leadSearch}
                      onChange={e => setLeadSearch(e.target.value)}
                      placeholder={t('common.search')}
                      className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewLeadForm(true)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors border-b border-border font-medium"
                  >
                    <Plus className="w-4 h-4" /> {t('leads.dialog.newLead')}
                  </button>
                  <div className="overflow-y-auto max-h-48">
                    {filteredLeads.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">{t('common.noData')}</p>}
                    {filteredLeads.map((lead: any) => (
                      <button
                        key={lead.id}
                        onClick={() => { updateDealField('leadId', lead.id); setShowLeadPicker(false); }}
                        className={cn(
                          'w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors text-sm',
                          deal.lead?.id === lead.id && 'bg-primary/10'
                        )}
                      >
                        <p className="font-medium">{lead.firstName} {lead.lastName ?? ''}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone}{lead.email ? ` · ${lead.email}` : ''}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{t('leads.dialog.newLead')}</p>
                    <button onClick={() => setShowNewLeadForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      autoFocus
                      value={newLeadForm.firstName}
                      onChange={e => setNewLeadForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder={`${t('common.name')} *`}
                      className="px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      value={newLeadForm.lastName}
                      onChange={e => setNewLeadForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder={t('common.lastName')}
                      className="px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <input
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder={`${t('common.phone')} *`}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowNewLeadForm(false)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors"
                    >{t('common.cancel')}</button>
                    <button
                      onClick={createLeadAndAssign}
                      disabled={creatingLead || !newLeadForm.firstName.trim() || !newLeadForm.phone.trim()}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >{creatingLead ? t('common.saving') : t('common.create')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Property picker ── */}
        <div ref={propPickerRef} className="bg-card rounded-xl border border-border p-4 relative" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building className="w-4 h-4 text-emerald-500" /> {t('deals.property')}
            </div>
            <button
              onClick={() => { setShowPropertyPicker(!showPropertyPicker); setPropSearch(''); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {deal.property ? <><Edit2 className="w-3 h-3" /> {t('common.edit')}</> : <><Plus className="w-3 h-3" /> {t('deals.dialog.selectProperty')}</>}
            </button>
          </div>
          {deal.property ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{deal.property.title}</p>
                <p className="text-xs text-muted-foreground">{deal.property.address}</p>
              </div>
              <button onClick={() => updateDealField('propertyId', null)} className="text-muted-foreground hover:text-destructive p-1" title={t('common.delete')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : <p className="text-xs text-muted-foreground">{t('deals.notAssigned')}</p>}

          {showPropertyPicker && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
              {!showNewPropForm ? (
                <>
                  <div className="flex items-center gap-2 p-2 border-b border-border">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      autoFocus
                      value={propSearch}
                      onChange={e => setPropSearch(e.target.value)}
                      placeholder={t('common.search')}
                      className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewPropForm(true)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors border-b border-border font-medium"
                  >
                    <Plus className="w-4 h-4" /> {t('properties.dialog.newProperty')}
                  </button>
                  <div className="overflow-y-auto max-h-48">
                    {filteredProperties.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">{t('common.noData')}</p>}
                    {filteredProperties.map((prop: any) => (
                      <button
                        key={prop.id}
                        onClick={() => { updateDealField('propertyId', prop.id); setShowPropertyPicker(false); }}
                        className={cn(
                          'w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors text-sm',
                          deal.property?.id === prop.id && 'bg-primary/10'
                        )}
                      >
                        <p className="font-medium">{prop.title}</p>
                        <p className="text-xs text-muted-foreground">{prop.address ?? ''}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{t('properties.dialog.newProperty')}</p>
                    <button onClick={() => setShowNewPropForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <input
                    autoFocus
                    value={newPropForm.title}
                    onChange={e => setNewPropForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={`${t('common.title')} *`}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    value={newPropForm.address}
                    onChange={e => setNewPropForm(f => ({ ...f, address: e.target.value }))}
                    placeholder={t('common.address')}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowNewPropForm(false)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors"
                    >{t('common.cancel')}</button>
                    <button
                      onClick={createPropertyAndAssign}
                      disabled={creatingProp || !newPropForm.title.trim()}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >{creatingProp ? t('common.saving') : t('common.create')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              💰 {t('deals.finances')}
            </div>
            {!editingFinances && (
              <button
                onClick={() => { setEditingFinances(true); setFinanceForm({ amount: deal.amount?.toString() ?? '', commission: deal.commission?.toString() ?? '', currency: deal.currency ?? 'USD' }); }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> {t('common.edit')}
              </button>
            )}
          </div>
          {!editingFinances ? (
            <div className="space-y-1">
              <p className="text-sm">{t('deals.amount')}: <span className="font-mono font-semibold">{formatPrice(deal.amount, deal.currency ?? 'USD', locale)}</span></p>
              {/* Show converted amount */}
              {deal.amount && nbuRate?.rate && deal.currency === 'USD' ? (
                <p className="text-xs text-muted-foreground">≈ {formatPrice(deal.amount * nbuRate.rate, 'UAH', locale)}</p>
              ) : deal.amount && nbuRate?.rate && deal.currency === 'UAH' ? (
                <p className="text-xs text-muted-foreground">≈ {formatPrice(deal.amount / nbuRate.rate, 'USD', locale)}</p>
              ) : null}
              <p className="text-sm">{t('deals.commission')}: <span className="font-mono font-semibold">{deal.commission != null ? `${deal.commission}%` : '—'}</span>
                {deal.amount && deal.commission ? (
                  <span className="text-xs text-muted-foreground ml-1">({formatPrice(deal.amount * deal.commission / 100, deal.currency ?? 'USD', locale)})</span>
                ) : null}
              </p>
              {deal.amount && deal.commission && nbuRate?.rate ? (() => {
                const commAmt = deal.amount * deal.commission / 100;
                const cur = deal.currency ?? 'USD';
                if (cur === 'USD') return <p className="text-xs text-muted-foreground">≈ {formatPrice(commAmt * nbuRate.rate, 'UAH', locale)}</p>;
                if (cur === 'UAH') return <p className="text-xs text-muted-foreground">≈ {formatPrice(commAmt / nbuRate.rate, 'USD', locale)}</p>;
                return null;
              })() : null}
              {nbuRate && (
                <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                  💱 {t('deals.nbuRate')}: 1 USD = {nbuRate.rate.toFixed(2)} UAH <span className="opacity-60">({nbuRate.date})</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('deals.amount')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    autoFocus
                    value={financeForm.amount}
                    onChange={e => setFinanceForm(f => ({ ...f, amount: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={financeForm.currency}
                    onChange={e => setFinanceForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-20 px-2 py-1.5 border border-border rounded-lg text-sm bg-background"
                  >
                    <option value="USD">USD</option>
                    <option value="UAH">UAH</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('deals.commission')} (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={financeForm.commission}
                  onChange={e => setFinanceForm(f => ({ ...f, commission: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditingFinances(false)}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors"
                >{t('common.cancel')}</button>
                <button
                  onClick={async () => {
                    await updateDealById(dealId, { amount: financeForm.amount, commission: financeForm.commission, currency: financeForm.currency });
                    toast.success(t('deals.saved'));
                    setEditingFinances(false);
                    fetchDeal();
                  }}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >{t('common.save')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex border-b border-border scroll-tabs"
          onScroll={e => {
            const el = e.currentTarget;
            el.classList.toggle('scrolled-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
          }}>
          {[
            { key: 'comments' as const, label: t('deals.comments'), icon: MessageSquare, count: comments.length },
            { key: 'checklist' as const, label: t('deals.checklist'), icon: CheckSquare, count: `${completedItems}/${checklist.length}` },
            { key: 'history' as const, label: t('deals.history'), icon: Clock, count: logs.length },
            ...(customFields.length > 0 ? [{ key: 'customFields' as const, label: t('deals.customFields'), icon: Settings, count: customFields.length }] : []),
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0',
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'comments' && (
            <div className="space-y-3">
              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <input ref={commentInputRef} value={newComment} onChange={handleCommentChange}
                    placeholder={`${t('deals.addComment')} (@${t('chat.mention')})`}
                    onKeyDown={handleCommentKeyDown}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {showMentions && filteredMentionUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-56 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto z-50">
                      {filteredMentionUsers.map((u: any, i: number) => (
                        <button key={u.id} onClick={() => insertCommentMention(u)}
                          className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50 transition',
                            i === mentionIdx && 'bg-primary/5')}>
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                            {getInitials(u.name ?? '?')}
                          </div>
                          <span className="truncate">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={addComment} className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('deals.noComments')}</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {getInitials(c.author?.name ?? c.author?.email ?? '?')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.author?.name ?? 'User'}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt, locale)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{renderCommentText(c.text)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-2">
              <div className="flex gap-2 mb-3">
                <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                  placeholder={t('deals.addCheckItem')}
                  onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={addCheckItem} className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {checklist.length > 0 && (
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0}%` }} />
                </div>
              )}
              {checklist.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('deals.emptyChecklist')}</p>
              ) : (
                checklist.map(item => (
                  <button key={item.id} onClick={() => toggleCheckItem(item.id, item.completed)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/30 transition text-left">
                    <div className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition',
                      item.completed ? 'bg-primary border-primary text-white' : 'border-border'
                    )}>
                      {item.completed && <span className="text-xs">✓</span>}
                    </div>
                    <span className={cn('text-sm', item.completed && 'line-through text-muted-foreground')}>{item.title}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('deals.noHistory')}</p>
              ) : (
                logs.map(log => {
                  const translateDetails = (text: string) => {
                    if (!text) return text;
                    return text.replace(/Етап:\s*(\S+)\s*→\s*(\S+)/, (_match, from, to) => {
                      const tFrom = t(`const.dealStage.${from}`);
                      const tTo = t(`const.dealStage.${to}`);
                      const labelFrom = tFrom && !tFrom.startsWith('const.') ? tFrom : (stages.find((s: any) => s.value === from)?.label ?? from);
                      const labelTo = tTo && !tTo.startsWith('const.') ? tTo : (stages.find((s: any) => s.value === to)?.label ?? to);
                      return `${t('common.stage')}: ${labelFrom} → ${labelTo}`;
                    });
                  };
                  return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{translateDetails(log.details ?? log.action)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{log.user?.name ?? t('deals.system')}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt, locale)}</span>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'customFields' && (
            <div className="space-y-4">
              {customFields.map(field => (
                <div key={field.id}>
                  <label className="text-sm font-medium mb-1 block">{field.label}</label>
                  {field.fieldType === 'select' ? (
                    <select value={cfValues[field.id] ?? ''} onChange={async (e) => {
                      const val = e.target.value;
                      setCfValues(prev => ({ ...prev, [field.id]: val }));
                      await upsertDealCustomFieldValue(dealId, field.id, val);
                      toast.success(t('deals.saved'));
                    }} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">{t('deals.choose')}</option>
                      {field.options?.split(',').map((opt: string) => <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>)}
                    </select>
                  ) : field.fieldType === 'checkbox' ? (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={cfValues[field.id] === 'true'} onChange={async (e) => {
                        const val = e.target.checked ? 'true' : 'false';
                        setCfValues(prev => ({ ...prev, [field.id]: val }));
                        await upsertDealCustomFieldValue(dealId, field.id, val);
                      }} className="rounded border-border" />
                      <span className="text-sm">{cfValues[field.id] === 'true' ? t('deals.yes') : t('deals.no')}</span>
                    </label>
                  ) : (
                    <input type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                      value={cfValues[field.id] ?? ''} onChange={(e) => setCfValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      onBlur={async () => {
                        if (cfValues[field.id] !== undefined) {
                          await upsertDealCustomFieldValue(dealId, field.id, cfValues[field.id]);
                          toast.success(t('deals.saved'));
                        }
                      }}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  )}
                </div>
              ))}
              {customFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('deals.noCustomFields')}</p>}
            </div>
          )}
        </div>
      </div>

      {deal.notes && (
        <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-sm font-semibold mb-2">{t('deals.notes')}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
        </div>
      )}
    </div>
  );
}
