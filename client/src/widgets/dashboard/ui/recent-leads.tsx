'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/shared/lib/format';
import { LEAD_SOURCES } from '@/shared/lib/constants';

const AVATAR_GRADIENTS = [
  'from-[#073B34] to-emerald-700',
  'from-[#0a5a4f] to-teal-600',
  'from-emerald-700 to-[#073B34]',
  'from-[#073B34] to-[#0d6b5e]',
  'from-teal-700 to-emerald-800',
  'from-[#0d6b5e] to-[#073B34]',
  'from-emerald-800 to-teal-700',
  'from-[#073B34] to-emerald-600',
];

export function RecentLeads({ leads }: { leads: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-2xl border border-border/60 dark:border-border/40 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#073B34] to-[#0a5a4f] flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-display font-semibold">{t('dashboard.recentLeads')}</h3>
        </div>
        <Link href="/leads" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
          {t('common.allItems')} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {(leads?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
      ) : (
        <div className="space-y-1">
          {(leads ?? []).map((lead: any, i: number) => (
            <Link href={`/leads/${lead?.id}`} key={lead?.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {(lead?.firstName ?? 'U')?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{lead?.firstName} {lead?.lastName ?? ''}</p>
                  <p className="text-xs text-muted-foreground">{lead?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">
                  {t(`const.leadSource.${lead?.source}`) || LEAD_SOURCES.find((s: any) => s.value === lead?.source)?.label || lead?.source}
                </p>
                <p className="text-[11px] text-muted-foreground/70">{formatDate(lead?.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
