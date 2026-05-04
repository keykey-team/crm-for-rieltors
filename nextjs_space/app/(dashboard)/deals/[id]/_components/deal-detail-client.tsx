'use client';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, Building, CheckSquare, MessageSquare, Clock, Plus, Send, Edit2, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DEAL_STAGES } from '@/lib/constants';
import { formatPrice, formatDate, formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/context';

export function DealDetailClient({ dealId }: { dealId: string }) {
  const { t, locale } = useTranslation();
  const [deal, setDeal] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'checklist' | 'history' | 'customFields'>('comments');
  const [stages, setStages] = useState(DEAL_STAGES);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [cfValues, setCfValues] = useState<Record<string, string>>({});

  const fetchDeal = useCallback(async () => {
    try {
      const [dealRes, commRes, checkRes, logRes, stagesRes, cfRes, cfvRes] = await Promise.all([
        fetch(`/api/deals/${dealId}`),
        fetch(`/api/deals/${dealId}/comments`),
        fetch(`/api/deals/${dealId}/checklist`),
        fetch(`/api/activity-log?entityType=deal&entityId=${dealId}`),
        fetch('/api/funnel-stages'),
        fetch('/api/deal-custom-fields'),
        fetch(`/api/deals/custom-field-values?dealId=${dealId}`),
      ]);
      const [dealData, commData, checkData, logData, stagesData, cfData, cfvData] = await Promise.all([
        dealRes.json(), commRes.json(), checkRes.json(), logRes.json(), stagesRes.json(), cfRes.json(), cfvRes.json(),
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

  const addComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`/api/deals/${dealId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment }),
    });
    if (res.ok) { setNewComment(''); fetchDeal(); }
  };

  const addCheckItem = async () => {
    if (!newCheckItem.trim()) return;
    const res = await fetch(`/api/deals/${dealId}/checklist`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newCheckItem, order: checklist.length }),
    });
    if (res.ok) { setNewCheckItem(''); fetchDeal(); }
  };

  const toggleCheckItem = async (itemId: string, completed: boolean) => {
    await fetch(`/api/deals/${dealId}/checklist`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, completed: !completed }),
    });
    fetchDeal();
  };

  const changeStage = async (stage: string) => {
    await fetch(`/api/deals/${dealId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
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
      <div className="flex items-center gap-3">
        <Link href="/deals" className="p-2 hover:bg-muted rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">{deal.title}</h1>
          <p className="text-sm text-muted-foreground">{t('deals.createdDate')} {formatDate(deal.createdAt, locale)}</p>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
              {t(`const.dealStage.${stage.value}`) || stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <User className="w-4 h-4 text-blue-500" /> {t('deals.contact')}
          </div>
          {deal.lead ? (
            <div>
              <p className="text-sm font-medium">{deal.lead.firstName} {deal.lead.lastName ?? ''}</p>
              <p className="text-xs text-muted-foreground">{deal.lead.phone}</p>
              <p className="text-xs text-muted-foreground">{deal.lead.email ?? ''}</p>
            </div>
          ) : <p className="text-xs text-muted-foreground">{t('deals.notAssigned')}</p>}
        </div>
        <div className="bg-white rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <Building className="w-4 h-4 text-emerald-500" /> {t('deals.property')}
          </div>
          {deal.property ? (
            <div>
              <p className="text-sm font-medium">{deal.property.title}</p>
              <p className="text-xs text-muted-foreground">{deal.property.address}</p>
            </div>
          ) : <p className="text-xs text-muted-foreground">{t('deals.notAssigned')}</p>}
        </div>
        <div className="bg-white rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            💰 {t('deals.finances')}
          </div>
          <p className="text-sm">{t('deals.amount')}: <span className="font-mono font-semibold">{formatPrice(deal.amount, 'USD', locale)}</span></p>
          <p className="text-sm">{t('deals.commission')}: <span className="font-mono font-semibold">{formatPrice(deal.commission, 'USD', locale)}</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex border-b border-border">
          {[
            { key: 'comments' as const, label: t('deals.comments'), icon: MessageSquare, count: comments.length },
            { key: 'checklist' as const, label: t('deals.checklist'), icon: CheckSquare, count: `${completedItems}/${checklist.length}` },
            { key: 'history' as const, label: t('deals.history'), icon: Clock, count: logs.length },
            ...(customFields.length > 0 ? [{ key: 'customFields' as const, label: t('deals.customFields'), icon: Settings, count: customFields.length }] : []),
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition',
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'comments' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder={t('deals.addComment')}
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                      {(c.author?.name ?? c.author?.email ?? '?')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.author?.name ?? 'User'}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt, locale)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
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
                logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{log.details ?? log.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{log.user?.name ?? t('deals.system')}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt, locale)}</span>
                      </div>
                    </div>
                  </div>
                ))
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
                      await fetch('/api/deals/custom-field-values', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId, fieldId: field.id, value: val }) });
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
                        await fetch('/api/deals/custom-field-values', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId, fieldId: field.id, value: val }) });
                      }} className="rounded border-border" />
                      <span className="text-sm">{cfValues[field.id] === 'true' ? t('deals.yes') : t('deals.no')}</span>
                    </label>
                  ) : (
                    <input type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                      value={cfValues[field.id] ?? ''} onChange={(e) => setCfValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      onBlur={async () => {
                        if (cfValues[field.id] !== undefined) {
                          await fetch('/api/deals/custom-field-values', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId, fieldId: field.id, value: cfValues[field.id] }) });
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
        <div className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-sm font-semibold mb-2">{t('deals.notes')}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
        </div>
      )}
    </div>
  );
}
