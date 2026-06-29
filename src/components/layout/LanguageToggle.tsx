import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/cn';

/** EN/ES segmented toggle. Persists choice (handled in i18n detection config). */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        'inline-flex overflow-hidden rounded-md border border-brand-steel',
        className,
      )}
      role="group"
      aria-label={t('header.languageLabel')}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={cn(
          'px-4 py-2.5 text-sm font-semibold transition-colors',
          locale === 'en'
            ? 'bg-brand-red text-brand-white'
            : 'bg-brand-charcoal text-brand-chrome hover:text-brand-white',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('es')}
        aria-pressed={locale === 'es'}
        className={cn(
          'px-4 py-2.5 text-sm font-semibold transition-colors',
          locale === 'es'
            ? 'bg-brand-red text-brand-white'
            : 'bg-brand-charcoal text-brand-chrome hover:text-brand-white',
        )}
      >
        ES
      </button>
    </div>
  );
}
