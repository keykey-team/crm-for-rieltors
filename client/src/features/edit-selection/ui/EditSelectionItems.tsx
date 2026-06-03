'use client';

import { useEffect, useState } from 'react';
import { Eye, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { removeSelectionItem, reorderSelectionItems, updateSelectionItem, type ClientReaction, type ClientSelection } from '@/entities/client-selection';
import { confirmAction } from '@/shared/lib/confirm-action';
import { formatDateTime, formatPrice } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';

export function EditSelectionItems({ selection, onUpdated }: { selection: ClientSelection; onUpdated: (value: ClientSelection) => void }) {
  const { t, locale } = useTranslation();
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(selection.items.map((item) => [item.id, toDraft(item)])));
  }, [selection]);

  const move = async (index: number, direction: number) => {
    const items = [...selection.items];
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const result = await reorderSelectionItems(selection.id, items.map((item, order) => ({ itemId: item.id, order })));
    onUpdated(result);
  };

  const setDraft = (itemId: string, patch: Partial<ItemDraft>) => {
    const item = selection.items.find((entry) => entry.id === itemId);
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? (item ? toDraft(item) : { agentComment: '', clientNote: '', clientReaction: null })),
        ...patch,
      },
    }));
  };

  const saveItem = async (itemId: string) => {
    const item = selection.items.find((entry) => entry.id === itemId);
    const draft = drafts[itemId];
    if (!item || !draft) return;
    setSavingId(itemId);
    try {
      const updated = await updateSelectionItem(selection.id, itemId, {
        agentComment: draft.agentComment || null,
        clientNote: draft.clientNote || null,
        clientReaction: draft.clientReaction,
      });
      onUpdated(updated);
      toast.success(t('common.updated'));
    } finally {
      setSavingId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    const ok = await confirmAction(t('common.deleteConfirm'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    setRemovingId(itemId);
    try {
      const updated = await removeSelectionItem(selection.id, itemId);
      onUpdated(updated);
      toast.success(t('common.deleted'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {selection.items.map((item, index) => (
        <div key={item.id} className="overflow-hidden rounded-[24px] border border-border bg-background/60 p-4 text-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-muted lg:w-48">
              {item.property.photos?.[0]?.cloudStoragePath || item.property.photos?.[0]?.url ? (
                <img src={item.property.photos[0].cloudStoragePath || item.property.photos[0].url} alt={item.property.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-base font-semibold">{item.property.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.property.address || item.property.district || t('selections.noAddress')}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{formatPrice(item.property.price ?? null, item.property.currency ?? 'USD', locale)}</span>
                    <span>{t('selections.areaLabel')}: {item.property.area ?? '—'} м²</span>
                    <span>{t('selections.roomsLabel')}: {item.property.rooms ?? '—'}</span>
                    <span>{t('selections.orderLabel')}: {index + 1}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => move(index, -1)} className="rounded-xl border border-border px-3 py-2 text-xs font-medium">↑</button>
                  <button onClick={() => move(index, 1)} className="rounded-xl border border-border px-3 py-2 text-xs font-medium">↓</button>
                  <button disabled={removingId === item.id} onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {reactionOptions(t).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDraft(item.id, { clientReaction: option.value })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${drafts[item.id]?.clientReaction === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'}`}
                  >
                    <option.icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                ))}
                <button onClick={() => setDraft(item.id, { clientReaction: null })} className="rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  {t('selections.clearStatus')}
                </button>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('selections.agentComment')}</label>
                  <textarea
                    value={drafts[item.id]?.agentComment ?? ''}
                    onChange={(event) => setDraft(item.id, { agentComment: event.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('selections.clientNote')}</label>
                  <textarea
                    value={drafts[item.id]?.clientNote ?? ''}
                    onChange={(event) => setDraft(item.id, { clientNote: event.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  {item.reactedAt ? `${t('selections.statusUpdatedAt')}: ${formatDateTime(item.reactedAt)}` : t('selections.noClientStatus')}
                </div>
                <button
                  disabled={savingId === item.id || !hasChanges(item, drafts[item.id])}
                  onClick={() => saveItem(item.id)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {savingId === item.id ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ItemDraft {
  agentComment: string;
  clientNote: string;
  clientReaction: ClientReaction | null;
}

function toDraft(item: ClientSelection['items'][number]): ItemDraft {
  return {
    agentComment: item.agentComment || '',
    clientNote: item.clientNote || '',
    clientReaction: item.clientReaction ?? null,
  };
}

function hasChanges(item: ClientSelection['items'][number], draft?: ItemDraft) {
  if (!draft) return false;
  return draft.agentComment !== (item.agentComment || '')
    || draft.clientNote !== (item.clientNote || '')
    || draft.clientReaction !== (item.clientReaction ?? null);
}

function reactionOptions(t: (key: string) => string): Array<{ value: ClientReaction; label: string; icon: typeof ThumbsUp }> {
  return [
    { value: 'like', label: t('selections.reaction.like'), icon: ThumbsUp },
    { value: 'dislike', label: t('selections.reaction.dislike'), icon: ThumbsDown },
    { value: 'want_to_view', label: t('selections.reaction.want_to_view'), icon: Eye },
  ];
}
