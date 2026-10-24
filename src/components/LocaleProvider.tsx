'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MessageKey, SiteLocale, translate } from '@/lib/messages';

interface LocaleContextValue {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>('fr');

  useEffect(() => {
    let active = true;
    fetch('/api/locale', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Locale lookup failed');
        return response.json() as Promise<{ locale: SiteLocale }>;
      })
      .then((data) => {
        if (!active) return;
        setLocaleState(data.locale);
        document.documentElement.lang = data.locale;
      })
      .catch(() => {
        if (!active) return;
        const browserLanguage = navigator.language.toLowerCase().split('-')[0];
        const browserLocale: SiteLocale = browserLanguage === 'fr' || browserLanguage === 'de' ? browserLanguage : 'en';
        setLocaleState(browserLocale);
        document.documentElement.lang = browserLocale;
      });

    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((nextLocale: SiteLocale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    void fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => undefined);
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => translate(locale, key, values),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
