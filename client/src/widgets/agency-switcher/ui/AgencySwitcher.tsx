'use client';

import { useAgencies, AgencyAvatar, AgencyBadge } from '@/entities/agency';
import { SwitchAgencyDropdown } from '@/features/switch-agency';
import { CreateAgencyButton } from '@/features/create-agency';

export function AgencySwitcher() {
  const { agencies, currentAgencyId } = useAgencies();
  const current = agencies.find((agency) => agency.id === currentAgencyId);

  return (
    <div className="mb-2 rounded-xl border border-border/40 p-2">
      {current && (
        <div className="mb-2 flex items-center gap-2">
          <AgencyAvatar agency={current} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{current.name}</p>
            <AgencyBadge role={current.role} />
          </div>
        </div>
      )}
      <SwitchAgencyDropdown />
      <div className="mt-2"><CreateAgencyButton /></div>
    </div>
  );
}
