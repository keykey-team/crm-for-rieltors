'use client';

import { useRouter } from 'next/navigation';
import { applyAgencySwitch, useAgencies } from '@/entities/agency';

export function SwitchAgencyDropdown() {
  const router = useRouter();
  const { agencies, currentAgencyId } = useAgencies();

  return (
    <select
      className="w-full rounded-lg border bg-background px-2 py-1 text-xs"
      value={currentAgencyId ?? ''}
      onChange={async (event) => {
        const nextAgencyId = event.target.value;
        if (!nextAgencyId) return;
        await applyAgencySwitch(nextAgencyId);
        router.refresh();
      }}
    >
      {agencies.map((agency) => (
        <option key={agency.id} value={agency.id}>{agency.name}</option>
      ))}
    </select>
  );
}
