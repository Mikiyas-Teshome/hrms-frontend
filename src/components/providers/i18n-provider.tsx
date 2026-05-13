"use client";

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: 'en' | 'ar';
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  // Sync initial language if provided (only once)
  const [synced, setSynced] = useState(false);

  if (!synced && initialLanguage && i18n.language !== initialLanguage) {
    (i18n as any).language = initialLanguage;
    setSynced(true);
  } 

  useEffect(() => {
    // On mount, apply direction based on current language
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
