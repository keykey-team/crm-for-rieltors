import { Clock3, Home, User } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format';
import type { Showing } from '../model/types';
import { ShowingStatusBadge } from './ShowingStatusBadge';

type ShowingCardProps = {
  showing: Showing;
  locale: string;
  statusLabel: string;
};

export function ShowingCard({ showing, locale, statusLabel }: ShowingCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{showing.property?.title || showing.property?.address || showing.propertyId}</p>
          <p className="text-xs text-muted-foreground">{showing.property?.address}</p>
        </div>
        <ShowingStatusBadge status={showing.status} label={statusLabel} />
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" />{formatDateTime(showing.scheduledAt, locale)}</div>
        <div className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5" />{showing.deal?.title || showing.dealId || '—'}</div>
        <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{showing.lead ? `${showing.lead.firstName || ''} ${showing.lead.lastName || ''}`.trim() : '—'}</div>
      </div>
    </div>
  );
}
