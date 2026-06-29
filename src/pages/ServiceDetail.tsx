import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getServiceBySlug } from '@/config/services.config';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney } from '@/lib/format';
import { Seo } from '@/components/seo/Seo';
import { ShareButton } from '@/components/ui/ShareButton';
import { buildBreadcrumbJsonLd } from '@/lib/schema';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const ls = useLocalizedService();
  const service = getServiceBySlug(slug);

  if (!service) return <NotFound />;

  const isMobile = service.category === 'mobile';
  const bookingPath = `/book?service=${service.slug}`;

  return (
    <>
      <Seo
        title={`${ls.name(service)} — ${t('common.appName')}`}
        description={ls.description(service)}
        path={`/services/${service.slug}`}
        jsonLd={buildBreadcrumbJsonLd([
          { name: t('nav.home'), path: '/' },
          { name: t('nav.services'), path: '/services' },
          { name: ls.name(service), path: `/services/${service.slug}` },
        ])}
      />
      <section className="container-content max-w-3xl py-10 sm:py-16">
        <Link to="/services" className="text-sm text-brand-chrome hover:text-brand-white">
          ← {t('services.backToServices')}
        </Link>
        <p className="mt-4 font-display text-sm uppercase tracking-wide text-brand-red">
          {t(`services.category.${service.category}`)}
        </p>
        <h1 className="mt-2 text-2xl sm:text-4xl text-brand-white">{ls.name(service)}</h1>
        <p className="mt-4 text-base sm:text-lg text-brand-chrome">{ls.description(service)}</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card">
            <dt className="text-sm text-brand-chrome">{t('payment.amount')}</dt>
            <dd className="mt-1 text-xl text-brand-white">
              {service.basePriceCents === 0
                ? t('common.free')
                : service.basePriceCents === null
                  ? t('common.quoteOnCall')
                  : `${t('common.from')} ${formatMoney(service.basePriceCents, locale)}`}
            </dd>
          </div>
          {service.depositCents > 0 && (
            <div className="card">
              <dt className="text-sm text-brand-chrome">{t('services.depositNote')}</dt>
              <dd className="mt-1 text-xl text-brand-white">
                {formatMoney(service.depositCents, locale)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {service.bookable && (
            <Link to={bookingPath} className="btn-primary">
              {isMobile ? t('services.requestMobile') : t('services.bookThis')}
            </Link>
          )}
          <ShareButton title={ls.name(service)} text={ls.description(service)} variant="secondary" />
        </div>
      </section>
    </>
  );
}
