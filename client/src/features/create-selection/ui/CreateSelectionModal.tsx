'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n/context';
import { getPublicUrl } from '@/entities/client-selection';
import { useCreateSelection } from '../model/useCreateSelection';

interface Props {
  leadId: string;
  propertyIds: string[];
  onCreated?: () => void;
}

export function CreateSelectionModal({ leadId, propertyIds, onCreated }: Props) {
  const { t } = useTranslation();
  const { submit, loading } = useCreateSelection();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    if (!propertyIds.length) return;
    const created = await submit({ leadId, propertyIds, title, message });
    await navigator.clipboard.writeText(getPublicUrl(created.publicSlug));
    toast.success(t('selections.createdAndCopied'));
    onCreated?.();
  };

  return (
    <div className="space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('selections.title')} className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('selections.message')} className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm" rows={2} />
      <button disabled={loading || !propertyIds.length} onClick={handleCreate} className="px-3 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50">
        {loading ? t('common.saving') : t('selections.createAndCopy')}
      </button>
    </div>
  );
}
