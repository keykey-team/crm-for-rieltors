'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/lib/i18n/context';
import { HintsProvider } from '@/lib/hints-context';
import { SidebarProvider } from '@/lib/sidebar-context';
import { PlanProvider } from '@/lib/plan-context';
import { BrandProvider } from '@/lib/brand-context';
import { SearchPalette } from '@/components/search-palette';
import { QuickCreateFab } from '@/components/quick-create-fab';

export function Providers({ children }: { children: React.ReactNode }) {
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
                  {children}
                  <SearchPalette />
                  <QuickCreateFab />
                </SidebarProvider>
              </BrandProvider>
            </PlanProvider>
          </HintsProvider>
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
