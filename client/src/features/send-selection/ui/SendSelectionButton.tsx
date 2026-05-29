'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { getPublicUrl } from '@/entities/client-selection';

export function SendSelectionButton({ slug, clientName }: { slug: string; clientName?: string }) {
  const { t } = useTranslation();
  const url = getPublicUrl(slug);
  const text = `${clientName || t('selections.client')} ${t('selections.shareText')} ${url}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => navigator.clipboard.writeText(text)} className="px-3 py-1.5 border rounded-lg text-sm">{t('calendar.copyLink')}</button>
      <a className="px-3 py-1.5 border rounded-lg text-sm" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank">WhatsApp</a>
      <a className="px-3 py-1.5 border rounded-lg text-sm" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank">Telegram</a>
      <a className="px-3 py-1.5 border rounded-lg text-sm" href={`mailto:?subject=${encodeURIComponent(t('selections.mailSubject'))}&body=${encodeURIComponent(text)}`}>Mail</a>
    </div>
  );
}
