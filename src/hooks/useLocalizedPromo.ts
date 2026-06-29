/** Pick EN/ES title + body for a promotion based on the active locale. */
import { useLocale } from './useLocale';
import type { PromotionRow } from '@/types/database.types';

export function useLocalizedPromo() {
  const { locale } = useLocale();
  return {
    title: (p: Pick<PromotionRow, 'title_en' | 'title_es'>) =>
      locale === 'es' ? p.title_es : p.title_en,
    body: (p: Pick<PromotionRow, 'body_en' | 'body_es'>) =>
      (locale === 'es' ? p.body_es : p.body_en) ?? '',
  };
}
