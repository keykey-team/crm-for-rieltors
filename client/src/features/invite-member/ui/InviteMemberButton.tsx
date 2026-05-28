'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { inviteMember, useCurrentAgency } from '@/entities/agency';
import { useTranslation } from '@/shared/lib/i18n/context';

export function InviteMemberButton() {
  const { currentAgencyId } = useCurrentAgency();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="rounded-lg border px-3 py-2 text-sm"
      disabled={!currentAgencyId || loading}
      onClick={async () => {
        const email = window.prompt(t('members.inviteByEmail'));
        if (!email || !currentAgencyId) return;
        setLoading(true);
        try {
          const response = await inviteMember(currentAgencyId, { email });
          if (response.invited) toast.success(t('common.created'));
          if (!response.invited && response.inviteLink) toast.info(`Invite link: ${response.inviteLink}`);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? '...' : t('members.invite')}
    </button>
  );
}
