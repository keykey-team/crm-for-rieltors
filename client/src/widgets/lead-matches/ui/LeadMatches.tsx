'use client';

import { useTranslation } from '@/shared/lib/i18n/context';
import { useLeadMatches } from '../model/useLeadMatches';
import { CreateSelectionModal } from '@/features/create-selection';

export function LeadMatches({ leadId }: { leadId: string }) {
  const { t } = useTranslation();
  const { matches, selected, toggle } = useLeadMatches(leadId);

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <h3 className="font-semibold">{t('matching.title')}</h3>
      <div className="space-y-2 max-h-72 overflow-auto">
        {matches.map((item) => (
          <label key={item.id} htmlFor={`lead-match-${item.id}`} className="flex items-center gap-2 text-sm">
            <input id={`lead-match-${item.id}`} type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
            <span className="flex-1">{item.title}</span>
            <span className="text-muted-foreground">{Math.round((item.score || 0) * 100)}%</span>
          </label>
        ))}
      </div>
      <CreateSelectionModal leadId={leadId} propertyIds={selected} />
    </div>
  );
}
