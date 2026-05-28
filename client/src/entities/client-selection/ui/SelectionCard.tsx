'use client';

import Link from 'next/link';
import type { ClientSelection } from '../model/types';
import { getPublicUrl } from '../lib/getPublicUrl';
import { useTranslation } from '@/shared/lib/i18n/context';

export function SelectionCard({ selection }: { selection: ClientSelection }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{selection.title || t('selections.untitled')}</h3>
          <p className="text-xs text-muted-foreground">{selection.items.length} {t('selections.items')}</p>
        </div>
        <Link href={getPublicUrl(selection.publicSlug)} className="text-sm text-primary" target="_blank">
          {t('selections.openPublic')}
        </Link>
      </div>
      {selection.message && <p className="text-sm mt-2 text-muted-foreground">{selection.message}</p>}
    </div>
  );
}
