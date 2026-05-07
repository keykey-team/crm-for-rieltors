'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, X, Crown, Zap, Rocket, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { usePlan } from '@/lib/plan-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PlanKey = 'free' | 'pro' | 'business';

interface PlanFeature {
  key: string;
  free: boolean | string;
  pro: boolean | string;
  business: boolean | string;
}

export function PricingClient() {
  const { t } = useTranslation();
  const { plan: currentPlan, accountType } = usePlan();
  const { data: session, update } = useSession() || {};
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const plans: { key: PlanKey; icon: typeof Crown; color: string; bg: string; priceKey: string }[] = [
    { key: 'free', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', priceKey: 'pricing.priceFree' },
    { key: 'pro', icon: Crown, color: 'text-primary', bg: 'bg-primary/10', priceKey: 'pricing.pricePro' },
    { key: 'business', icon: Rocket, color: 'text-[#073B34] dark:text-[#CEFD56]', bg: 'bg-[#073B34]/5 dark:bg-[#CEFD56]/5', priceKey: 'pricing.priceBusiness' },
  ];

  const features: PlanFeature[] = [
    { key: 'pricing.feat.leads', free: '50', pro: '∞', business: '∞' },
    { key: 'pricing.feat.properties', free: '20', pro: '∞', business: '∞' },
    { key: 'pricing.feat.deals', free: true, pro: true, business: true },
    { key: 'pricing.feat.tasks', free: true, pro: true, business: true },
    { key: 'pricing.feat.calendar', free: true, pro: true, business: true },
    { key: 'pricing.feat.chessGrid', free: true, pro: true, business: true },
    { key: 'pricing.feat.analytics', free: false, pro: true, business: true },
    { key: 'pricing.feat.automations', free: false, pro: true, business: true },
    { key: 'pricing.feat.templates', free: false, pro: true, business: true },
    { key: 'pricing.feat.knowledgeBase', free: false, pro: true, business: true },
    { key: 'pricing.feat.activityLog', free: false, pro: true, business: true },
    { key: 'pricing.feat.branding', free: false, pro: true, business: true },
    { key: 'pricing.feat.team', free: false, pro: false, business: true },
    { key: 'pricing.feat.chat', free: false, pro: false, business: true },
    { key: 'pricing.feat.distribution', free: false, pro: false, business: true },
    { key: 'pricing.feat.aftercare', free: false, pro: false, business: true },
  ];

  const handleSelectPlan = async (planKey: PlanKey) => {
    if (planKey === currentPlan) return;
    setUpgrading(planKey);
    try {
      const res = await fetch('/api/users/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (!res.ok) throw new Error();
      // Update session
      await update();
      toast.success(t('pricing.upgraded'));
      // Force page reload to refresh session token
      window.location.reload();
    } catch {
      toast.error(t('pricing.upgradeError'));
    } finally {
      setUpgrading(null);
    }
  };

  const planOrder: PlanKey[] = ['free', 'pro', 'business'];
  const currentIdx = planOrder.indexOf(currentPlan);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Crown className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-display font-bold tracking-tight">{t('pricing.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('pricing.subtitle')}</p>
        {accountType && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
            <span className="text-muted-foreground">{t('pricing.yourType')}:</span>
            <span className="font-semibold">{t(`pricing.type.${accountType}`)}</span>
          </div>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((p, idx) => {
          const isCurrent = p.key === currentPlan;
          const isPopular = p.key === 'pro';
          const canSelect = idx > currentIdx;
          return (
            <div key={p.key} className={cn(
              'relative rounded-2xl border-2 p-6 transition-all',
              isCurrent ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card hover:shadow-md',
              isPopular && !isCurrent && 'border-primary/40'
            )} style={{ boxShadow: isCurrent ? 'var(--shadow-lg)' : undefined }}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  {t('pricing.popular')}
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {t('pricing.current')}
                </div>
              )}
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', p.bg)}>
                <p.icon className={cn('w-6 h-6', p.color)} />
              </div>
              <h3 className="text-lg font-display font-bold">{t(`pricing.plan.${p.key}`)}</h3>
              <p className="text-2xl font-bold mt-2">{t(p.priceKey)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(`pricing.planDesc.${p.key}`)}</p>

              <button
                type="button"
                onClick={() => canSelect && handleSelectPlan(p.key)}
                disabled={isCurrent || !canSelect || !!upgrading}
                className={cn(
                  'w-full mt-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
                  isCurrent
                    ? 'bg-muted text-muted-foreground cursor-default'
                    : canSelect
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-default'
                )}
              >
                {upgrading === p.key ? t('pricing.upgrading') :
                  isCurrent ? t('pricing.currentPlan') :
                  canSelect ? <>{t('pricing.upgrade')} <ArrowRight className="w-4 h-4" /></> :
                  t('pricing.currentPlan')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-display font-bold">{t('pricing.comparison')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3 font-medium">{t('pricing.feature')}</th>
                {plans.map(p => (
                  <th key={p.key} className={cn('text-center px-4 py-3 font-semibold', p.key === currentPlan && 'text-primary bg-primary/5')}>
                    {t(`pricing.plan.${p.key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feat, i) => (
                <tr key={feat.key} className={cn('border-b border-border/50', i % 2 === 0 && 'bg-muted/10')}>
                  <td className="px-6 py-3 font-medium">{t(feat.key)}</td>
                  {(['free', 'pro', 'business'] as const).map(planKey => {
                    const val = feat[planKey];
                    return (
                      <td key={planKey} className={cn('text-center px-4 py-3', planKey === currentPlan && 'bg-primary/5')}>
                        {val === true ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> :
                          val === false ? <X className="w-5 h-5 text-muted-foreground/30 mx-auto" /> :
                          <span className="font-semibold">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">{t('pricing.note')}</p>
    </div>
  );
}
