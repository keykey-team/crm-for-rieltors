'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAgency, setCurrentAgencyId } from '@/entities/agency';
import { useTranslation } from '@/shared/lib/i18n/context';

export function CreateAgencyButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="w-full rounded-lg border px-2 py-1 text-xs"
      disabled={loading}
      onClick={async () => {
        const name = window.prompt(t('agency.title'));
        if (!name) return;
        setLoading(true);
        try {
          const agency = await createAgency({ name });
          setCurrentAgencyId(agency.id);
          toast.success(t('common.created'));
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? '...' : t('agency.create')}
    </button>
  );
}
