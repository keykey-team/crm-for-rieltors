'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/shared/lib/format';
import { LEAD_SOURCES } from '@/shared/lib/constants';

export function RecentLeads({ leads }: { leads: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Останні ліди</h3>
        </div>
        <Link href="/leads" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          Всі <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {(leads?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Лідів поки немає</p>
      ) : (
        <div className="space-y-3">
          {(leads ?? []).map((lead: any) => (
            <div key={lead?.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {(lead?.firstName ?? 'U')?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{lead?.firstName} {lead?.lastName ?? ''}</p>
                  <p className="text-xs text-muted-foreground">{lead?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {t(`const.leadSource.${lead?.source}`) || LEAD_SOURCES.find((s: any) => s.value === lead?.source)?.label || lead?.source}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(lead?.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
