'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarClock, ExternalLink, Eye, Home, MessageSquareHeart, UserRound, type LucideIcon } from 'lucide-react';
import type { ClientSelection } from '../model/types';
import { getPublicUrl } from '../lib/getPublicUrl';
import { useTranslation } from '@/shared/lib/i18n/context';
import { formatDateTime } from '@/shared/lib/format';

interface Props {
  selection: ClientSelection;
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function SelectionCard({ selection, children, selected = false, onClick }: Props) {
  const { t } = useTranslation();
  const clientName = [selection.lead?.firstName, selection.lead?.lastName].filter(Boolean).join(' ') || t('selections.clientUnknown');
  const reacted = selection.items.filter((item) => item.clientReaction).length;
  const wantToView = selection.items.filter((item) => item.clientReaction === 'want_to_view').length;
  const expired = Boolean(selection.expiresAt && new Date(selection.expiresAt).getTime() < Date.now());
  const interactionLabel = selection.viewsCount ? t('selections.statusViewed') : t('selections.statusFresh');

  return (
    <article
      className={`space-y-3 rounded-2xl border bg-card p-4 transition ${selected ? 'border-primary/50' : 'border-border'} ${onClick ? 'cursor-pointer hover:border-primary/35 hover:bg-muted/10' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{selection.title || t('selections.untitled')}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{selection.message || t('selections.noMessage')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{expired ? t('selections.statusExpired') : t('selections.statusActive')}</Badge>
            <Badge>{interactionLabel}</Badge>
          </div>
        </div>
        <Link href={getPublicUrl(selection.publicSlug)} className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
          <ExternalLink className="h-4 w-4" />
          {t('selections.openPublic')}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border/60 pt-3 sm:grid-cols-3 xl:grid-cols-5">
        <Meta icon={UserRound} label={t('selections.client')} value={clientName} />
        <Meta icon={Home} label={t('selections.itemsLabel')} value={`${selection.items.length}`} />
        <Meta icon={Eye} label={t('selections.views')} value={`${selection.viewsCount ?? 0}`} />
        <Meta icon={MessageSquareHeart} label={t('selections.reactions')} value={`${reacted}/${selection.items.length}`} />
        <Meta icon={CalendarClock} label={t('selections.lastViewed')} value={formatDateTime(selection.lastViewedAt)} />
      </div>

      {wantToView > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t('selections.wantToViewCount')}: <span className="font-medium text-foreground">{wantToView}</span>
        </p>
      ) : null}

      {children}
    </article>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground">{children}</span>;
}

function Meta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
