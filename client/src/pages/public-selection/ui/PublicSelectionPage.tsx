'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Eye, Heart, MessageSquareText, ThumbsDown } from 'lucide-react';
import { getPublicSelection, recordSelectionReaction } from '@/entities/client-selection';
import type { ClientReaction, ClientSelection } from '@/entities/client-selection';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';
import { toast } from 'sonner';

export function PublicSelectionPage({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const [selection, setSelection] = useState<ClientSelection | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'not_found'>('loading');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setStatus('loading');
    getPublicSelection(slug)
      .then((data) => {
        setSelection(data);
        setNotes(Object.fromEntries(data.items.map((item) => [item.id, item.clientNote || ''])));
        setStatus('ready');
      })
      .catch((error: Error) => {
        setSelection(null);
        setStatus(error.message.toLowerCase().includes('expired') ? 'expired' : 'not_found');
      });
  }, [slug]);

  const react = async (itemId: string, reaction: ClientReaction) => {
    try {
      setSavingId(itemId);
      const updated = await recordSelectionReaction(slug, itemId, reaction, notes[itemId]);
      setSelection(updated);
      setNotes(Object.fromEntries(updated.items.map((item) => [item.id, item.clientNote || ''])));
      toast.success(t('selections.reactionSaved'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSavingId(null);
    }
  };

  if (status === 'loading') {
    return <div className="mx-auto max-w-6xl p-6 text-center text-sm text-muted-foreground">{t('common.loading')}</div>;
  }

  if (status === 'expired') {
    return <StateCard title={t('selections.publicExpiredTitle')} description={t('selections.publicExpiredDescription')} />;
  }

  if (!selection || status === 'not_found') {
    return <StateCard title={t('selections.notFound')} description={t('selections.publicNotFoundDescription')} />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(7,59,52,0.08),rgba(255,255,255,0)_22%),radial-gradient(circle_at_top_right,rgba(206,253,86,0.28),transparent_28%)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-border bg-card shadow-[var(--shadow-lg)]">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-4">
              {selection.createdBy?.brandLogo ? <img src={selection.createdBy.brandLogo} alt={selection.createdBy.brandName || 'Brand'} className="h-12 w-auto" /> : null}
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{selection.createdBy?.brandName || t('selections.title')}</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{selection.title || t('selections.title')}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{selection.message || t('selections.publicSubtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <InfoPill icon={MessageSquareText}>{selection.items.length} {t('selections.items')}</InfoPill>
                <InfoPill icon={Eye}>{t('selections.views')}: {selection.viewsCount ?? 0}</InfoPill>
                <InfoPill icon={CalendarClock}>{t('selections.expiresAt')}: {formatDate(selection.expiresAt, locale)}</InfoPill>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-background/70 p-5">
              <p className="text-sm font-medium">{t('selections.publicIntroTitle')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t('selections.publicIntroDescription')}</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <span className="mt-0.5 text-lg">1</span>
                  <span>{t('selections.publicStepBrowse')}</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <span className="mt-0.5 text-lg">2</span>
                  <span>{t('selections.publicStepReact')}</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <span className="mt-0.5 text-lg">3</span>
                  <span>{t('selections.publicStepNote')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5">
          {selection.items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
              <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[24px] bg-muted">
                    {item.property.photos?.[0]?.cloudStoragePath || item.property.photos?.[0]?.url ? (
                      <img src={item.property.photos[0].cloudStoragePath || item.property.photos[0].url} alt={item.property.title} className="h-[300px] w-full object-cover" />
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">{t('selections.noPhoto')}</div>
                    )}
                  </div>
                  {item.property.photos && item.property.photos.length > 1 ? (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {item.property.photos.slice(1).map((photo, index) => (
                        <img key={photo.cloudStoragePath || photo.url || index} src={photo.cloudStoragePath || photo.url} alt={item.property.title} className="h-20 w-28 shrink-0 rounded-2xl object-cover" />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">{t('selections.itemsLabel')}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{item.property.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.property.address || item.property.district || t('selections.noAddress')}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label={t('selections.priceLabel')} value={formatPrice(item.property.price ?? null, item.property.currency ?? 'USD', locale)} />
                    <Metric label={t('selections.areaLabel')} value={`${item.property.area ?? '—'} м²`} />
                    <Metric label={t('selections.roomsLabel')} value={`${item.property.rooms ?? '—'}`} />
                  </div>

                  {item.agentComment ? (
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('selections.agentComment')}</p>
                      <p className="mt-2 text-sm">{item.agentComment}</p>
                    </div>
                  ) : null}

                  <div className="space-y-3 rounded-2xl border border-border bg-background/70 p-4">
                    <div>
                      <p className="text-sm font-medium">{t('selections.responseTitle')}</p>
                      <p className="text-xs text-muted-foreground">{t('selections.responseDescription')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reactionButtons(t).map((option) => (
                        <button
                          key={option.value}
                          disabled={savingId === item.id}
                          onClick={() => react(item.id, option.value)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${item.clientReaction === option.value ? 'border-primary bg-primary text-white' : 'border-border bg-card hover:border-primary/35'} disabled:opacity-60`}
                        >
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('selections.clientNote')}</label>
                      <textarea
                        value={notes[item.id] ?? ''}
                        onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                        rows={4}
                        placeholder={t('selections.publicNotePlaceholder')}
                        className="w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.clientReaction ? `${t('selections.responseStatus')}: ${t(`selections.reaction.${item.clientReaction}`)}` : t('selections.noClientStatus')}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function reactionButtons(t: (key: string) => string) {
  return [
    { value: 'like' as const, label: t('selections.reaction.like'), icon: Heart },
    { value: 'want_to_view' as const, label: t('selections.reaction.want_to_view'), icon: MessageSquareText },
    { value: 'dislike' as const, label: t('selections.reaction.dislike'), icon: ThumbsDown },
  ];
}

function StateCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-8">
      <div className="rounded-[28px] border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, children }: { icon: typeof Eye; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{children}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}
