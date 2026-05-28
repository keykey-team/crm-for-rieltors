'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/shared/widgets/theme-provider';
import { I18nProvider } from '@/shared/lib/i18n/context';
import { HintsProvider } from '@/shared/lib/hints-context';
import { SidebarProvider } from '@/shared/lib/sidebar-context';
import { PlanProvider } from '@/shared/lib/plan-context';
import { BrandProvider } from '@/shared/lib/brand-context';
import { SearchPalette } from '@/shared/widgets/search-palette';
import { QuickCreateFab } from '@/shared/widgets/quick-create-fab';
import { HelperChat } from '@/shared/widgets/helper-chat';
import { CrmSessionBridge } from '@/shared/widgets/crm-session-bridge';
import { useCurrentAgency } from '@/entities/agency';

export function Providers({ children }: { children: React.ReactNode }) {
  useCurrentAgency();

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange
      >
        <I18nProvider>
          <HintsProvider>
            <PlanProvider>
              <BrandProvider>
                <SidebarProvider>
                  <CrmSessionBridge />
                  {children}
                  <SearchPalette />
                  <QuickCreateFab />
                  <HelperChat />
                </SidebarProvider>
              </BrandProvider>
            </PlanProvider>
          </HintsProvider>
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
