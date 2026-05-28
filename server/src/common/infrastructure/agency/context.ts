import { AsyncLocalStorage } from 'node:async_hooks';

export interface AgencyContext {
  agencyId: string;
  userId: string;
  membershipRole: string;
}

const agencyContextStorage = new AsyncLocalStorage<AgencyContext>();

export function runWithAgencyContext<T>(context: AgencyContext, callback: () => T): T {
  return agencyContextStorage.run(context, callback);
}

export function getAgencyContext(): AgencyContext | undefined {
  return agencyContextStorage.getStore();
}

export function setAgencyContext(context: AgencyContext): void {
  agencyContextStorage.enterWith(context);
}
