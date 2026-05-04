'use client';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
}

export function StatsCard({ icon: Icon, label, value, sub, color, bg }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 transition-all hover:scale-[1.02]" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
