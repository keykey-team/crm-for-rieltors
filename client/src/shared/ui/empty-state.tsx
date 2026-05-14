'use client';
import { LucideIcon, Plus } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18n/context';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
