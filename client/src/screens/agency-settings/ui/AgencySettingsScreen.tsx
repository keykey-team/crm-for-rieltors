'use client';

import { useEffect, useState } from 'react';
import { AgencyMember, getAgencyMembers, useAgencies, useCurrentAgency } from '@/entities/agency';
import { InviteMemberButton } from '@/features/invite-member';
import { useTranslation } from '@/shared/lib/i18n/context';

export function AgencySettingsScreen() {
  const { t } = useTranslation();
  const { agencies } = useAgencies();
  const { currentAgencyId } = useCurrentAgency();
  const [members, setMembers] = useState<AgencyMember[]>([]);

  useEffect(() => {
    if (!currentAgencyId) return;
    getAgencyMembers(currentAgencyId).then(setMembers).catch(() => setMembers([]));
  }, [currentAgencyId]);

  const current = agencies.find((agency) => agency.id === currentAgencyId);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">{current?.name ?? t('agency.settings')}</h1>
      <p className="text-sm text-muted-foreground">Slug: {current?.slug ?? '-'}</p>
      <InviteMemberButton />
      <div className="rounded-xl border p-3">
        <p className="mb-2 text-sm font-medium">{t('members.team')}</p>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between text-sm">
              <span>{member.user?.name || member.user?.email}</span>
              <span className="text-muted-foreground">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
