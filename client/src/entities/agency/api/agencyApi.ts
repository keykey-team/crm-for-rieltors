import type { Agency, AgencyMember } from '../model/types';
import { getCurrentAgencyId, setCurrentAgencyId } from '../model/useCurrentAgency';

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Request failed');
  return data as T;
}

function withAgencyHeader(headers: HeadersInit = {}) {
  const currentAgencyId = getCurrentAgencyId();
  if (!currentAgencyId) return headers;
  return { ...headers, 'X-Agency-Id': currentAgencyId };
}

export function getAgencies() {
  return fetch('/api/agencies/me', { headers: withAgencyHeader() }).then(parse<Agency[]>);
}

export function switchAgency(agencyId: string) {
  return fetch(`/api/agencies/${agencyId}/switch`, { method: 'POST', headers: withAgencyHeader() }).then(parse<{ agencyId: string }>);
}

export function createAgency(payload: { name: string; slug?: string }) {
  return fetch('/api/agencies', {
    method: 'POST',
    headers: withAgencyHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(parse<Agency>);
}

export function getAgencyMembers(agencyId: string) {
  return fetch(`/api/agencies/${agencyId}/members`, { headers: withAgencyHeader() }).then(parse<AgencyMember[]>);
}

export function inviteMember(agencyId: string, payload: { email: string; role?: string }) {
  return fetch(`/api/agencies/${agencyId}/members`, {
    method: 'POST',
    headers: withAgencyHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(parse<{ invited: boolean; inviteLink?: string }>);
}

export async function applyAgencySwitch(agencyId: string) {
  await switchAgency(agencyId);
  setCurrentAgencyId(agencyId);
}
