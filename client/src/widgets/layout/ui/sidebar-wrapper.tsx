'use client';

import { useSidebar } from '@/shared/lib/sidebar-context';
import { TelegramAssistant } from '@/shared/layout/telegram-assistant';
import { cn } from '@/shared/lib/utils';

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main className={cn(
      'main-content transition-all duration-300 min-h-screen bg-background',
      collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
    )}>
      <div className="p-4 md:p-6 lg:p-8 pt-[72px] lg:pt-8">
        {children}
      </div>
      <TelegramAssistant />
    </main>
  );
}
