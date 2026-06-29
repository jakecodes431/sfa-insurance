import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublishedPromotions } from '@/lib/data';
import { useLocalizedPromo } from '@/hooks/useLocalizedPromo';
import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/lib/format';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { PromotionRow } from '@/types/database.types';

export default function Promotions() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const lp = useLocalizedPromo();
  const [promos, setPromos] = useState<PromotionRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getPublishedPromotions().then((p) => {
      setPromos(p);
      setLoaded(true);
    });
  }, []);

  return (
    <>
      <Seo title={t('promotions.seoTitle')} description={t('promotions.seoDescription')} path="/promotions" />
      <section className="container-content py-10 sm:py-16">
        <SectionHeading title={t('promotions.heading')} subtitle={t('promotions.sub')} />

        {loaded && promos.length === 0 && (
          <p className="mt-8 text-brand-chrome">{t('promotions.none')}</p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => (
            <Link
              key={p.id}
              to={`/promotions/${p.slug}`}
              className="card flex flex-col transition-colors hover:border-brand-red"
            >
              <span className="font-display text-xs uppercase tracking-wide text-brand-red">
                {p.is_event ? t('promotions.event') : t('promotions.promo')}
              </span>
              <h2 className="mt-2 text-xl text-brand-white">{lp.title(p)}</h2>
              <p className="mt-2 flex-1 text-sm text-brand-chrome line-clamp-4">{lp.body(p)}</p>
              {p.is_event && p.event_start && (
                <p className="mt-3 text-xs text-brand-chrome">
                  {t('promotions.startsAt')}: {formatDateTime(p.event_start, locale)}
                </p>
              )}
              <span className="mt-3 font-display text-sm uppercase tracking-wide text-brand-red">
                {t('common.learnMore')} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
