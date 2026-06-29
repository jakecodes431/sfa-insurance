/** useLocale — read/switch the active locale and keep <html lang> in sync. */
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type AppLocale } from '@/i18n';

export function useLocale() {
  const { i18n } = useTranslation();
  const locale = (
    SUPPORTED_LOCALES.includes(i18n.language as AppLocale) ? i18n.language : 'en'
  ) as AppLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'es' : 'en');
  }, [locale, setLocale]);

  return { locale, setLocale, toggleLocale };
}
