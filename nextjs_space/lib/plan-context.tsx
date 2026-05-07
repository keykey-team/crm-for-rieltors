'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

export type AccountType = 'agent' | 'agency';
export type PlanType = 'free' | 'pro' | 'business';

interface PlanContextType {
  accountType: AccountType;
  plan: PlanType;
  hasFeature: (feature: string) => boolean;
}

// Features gated by plan
const PLAN_FEATURES: Record<string, PlanType[]> = {
  chat: ['business'],
  team: ['business'],
  distribution: ['business'],
  aftercare: ['business'],
  automations: ['pro', 'business'],
  templates: ['pro', 'business'],
  analytics: ['pro', 'business'],
  activityLog: ['pro', 'business'],
  knowledgeBase: ['pro', 'business'],
  unlimitedLeads: ['pro', 'business'],
  unlimitedProperties: ['pro', 'business'],
  branding: ['pro', 'business'],
};

const PlanContext = createContext<PlanContextType>({
  accountType: 'agent',
  plan: 'free',
  hasFeature: () => true,
});

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {};
  const user = session?.user as any;
  const accountType: AccountType = user?.accountType ?? 'agent';
  const plan: PlanType = user?.plan ?? 'free';

  const hasFeature = (feature: string): boolean => {
    const allowedPlans = PLAN_FEATURES[feature];
    if (!allowedPlans) return true; // not gated
    return allowedPlans.includes(plan);
  };

  return (
    <PlanContext.Provider value={{ accountType, plan, hasFeature }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
