'use client';

import { I18nProvider } from '@/shared/lib/i18n/context';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeAppProvider } from './theme-app-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeAppProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeAppProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
