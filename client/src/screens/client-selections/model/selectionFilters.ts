import type { ClientSelection } from '@/entities/client-selection';

export type SelectionFilter = 'all' | 'viewed' | 'not_viewed' | 'with_reactions' | 'want_to_view' | 'active' | 'expired';

export function matchesSelectionFilter(selection: ClientSelection, filter: SelectionFilter) {
  const views = selection.viewsCount ?? 0;
  const reactions = selection.items.filter((item) => item.clientReaction).length;
  const wantsView = selection.items.some((item) => item.clientReaction === 'want_to_view');
  const expiresAt = selection.expiresAt ? new Date(selection.expiresAt).getTime() : null;
  const expired = expiresAt !== null && expiresAt < Date.now();

  if (filter === 'viewed') return views > 0;
  if (filter === 'not_viewed') return views === 0;
  if (filter === 'with_reactions') return reactions > 0;
  if (filter === 'want_to_view') return wantsView;
  if (filter === 'active') return !expired;
  if (filter === 'expired') return expired;
  return true;
}
