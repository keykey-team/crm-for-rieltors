'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Locale, LOCALE_LABELS } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'uk',
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uk');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('crm_locale') as Locale | null;
      if (saved && translations[saved]) {
        setLocaleState(saved);
      }
    } catch {}
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('crm_locale', l); } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] ?? translations['uk']?.[key] ?? key;
  }, [locale]);

  // Always render with 'uk' on server, switch on client
  const value = { locale: mounted ? locale : 'uk', setLocale, t: mounted ? t : (key: string) => translations['uk']?.[key] ?? key };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}

export { LOCALE_LABELS };
export type { Locale };
