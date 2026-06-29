/** Pick the EN/ES name + description for a service based on the active locale. */
import { useLocale } from './useLocale';
import type { Service } from '@/config/services.config';

export function useLocalizedService() {
  const { locale } = useLocale();
  return {
    name: (s: Pick<Service, 'name_en' | 'name_es'>) => (locale === 'es' ? s.name_es : s.name_en),
    description: (s: Pick<Service, 'description_en' | 'description_es'>) =>
      locale === 'es' ? s.description_es : s.description_en,
  };
}
