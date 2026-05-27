import { getInitials } from '@/shared/lib/format';

export function LeadAvatar({ firstName, lastName, size = 'md' }: { firstName: string; lastName?: string | null; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
  return (
    <div className={`${cls} rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold`}>
      {getInitials(`${firstName} ${lastName ?? ''}`)}
    </div>
  );
}
