'use client';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
  gradient?: string;
  href?: string;
}

export function StatsCard({ icon: Icon, label, value, sub, color, bg, gradient, href }: StatsCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm',
          gradient || bg
        )}>
          <Icon className={cn('w-[22px] h-[22px]', gradient ? 'text-white' : color)} />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />}
      </div>
      <p className="text-[28px] font-display font-bold tracking-tight leading-none">{value}</p>
      <p className="text-sm text-muted-foreground font-medium mt-0.5">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>
    </>
  );

  const cardClass = cn(
    'group block rounded-2xl p-5 transition-all duration-200 border',
    'bg-card border-border/60 dark:border-border/40',
    'hover:shadow-md hover:-translate-y-0.5',
    href && 'cursor-pointer'
  );

  if (href) {
    return <Link href={href} className={cardClass}>{content}</Link>;
  }

  return <div className={cardClass}>{content}</div>;
}
