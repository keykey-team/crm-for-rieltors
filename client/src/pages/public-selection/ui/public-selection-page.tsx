'use client';

import { useEffect, useState } from 'react';
import { getPublicSelection, recordSelectionReaction } from '@/entities/client-selection';
import type { ClientSelection } from '@/entities/client-selection';
import { useTranslation } from '@/shared/lib/i18n/context';
import { toast } from 'sonner';

export function PublicSelectionPage({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<ClientSelection | null>(null);

  useEffect(() => {
    getPublicSelection(slug).then(setSelection).catch(() => setSelection(null));
  }, [slug]);

  const react = async (itemId: string, reaction: 'like' | 'dislike' | 'want_to_view') => {
    try {
      setSelection(await recordSelectionReaction(slug, itemId, reaction));
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (!selection) return <div className="p-6 text-center text-sm text-muted-foreground">{t('selections.notFound')}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="text-center">
        {selection.createdBy?.brandLogo && <img src={selection.createdBy.brandLogo} alt="Brand" className="h-10 mx-auto mb-3" />}
        <h1 className="text-2xl font-semibold">{selection.title || t('selections.title')}</h1>
        {selection.message && <p className="text-muted-foreground mt-1">{selection.message}</p>}
      </div>
      {selection.items.map((item) => (
        <div key={item.id} className="border border-border rounded-xl p-4">
          <div className="flex gap-3 overflow-x-auto">
            {(item.property.photos || []).map((photo, idx: number) => (
              <img key={photo.url || photo.cloudStoragePath || idx} src={photo.cloudStoragePath || photo.url} alt={item.property.title} className="h-40 w-56 object-cover rounded-lg" />
            ))}
          </div>
          <h3 className="font-semibold mt-3">{item.property.title}</h3>
          <p className="text-sm text-muted-foreground">{item.property.address}</p>
          <p className="text-sm mt-1">{item.property.price} {item.property.currency} • {item.property.area || '—'} м²</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => react(item.id, 'like')} className="px-3 py-1.5 border rounded-lg">👍</button>
            <button onClick={() => react(item.id, 'dislike')} className="px-3 py-1.5 border rounded-lg">👎</button>
            <button onClick={() => react(item.id, 'want_to_view')} className="px-3 py-1.5 border rounded-lg">👁</button>
          </div>
        </div>
      ))}
    </div>
  );
}
