import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { servicesByCategory } from '@/config/services.config';
import { useContent } from '@/lib/content';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { CallButton } from '@/components/ui/CallButton';
import { Reveal } from '@/components/ui/Reveal';
import { PhoneIcon, TruckIcon } from '@/components/ui/Icons';

export default function Services() {
  const { t } = useTranslation();
  const inShop = servicesByCategory('in_shop');
  const mobile = servicesByCategory('mobile');
  const consultation = servicesByCategory('consultation');
  // Admin-editable page copy (falls back to bundled i18n until edited).
  const c = {
    heading: useContent('services.heading', t('services.heading')),
    sub: useContent('services.sub', t('services.sub')),
    howHeading: useContent('services.how_heading', t('services.how.heading')),
    mobileBanner: useContent('services.mobile_banner', t('services.mobileBanner')),
    mobileBannerSub: useContent('services.mobile_banner_sub', t('services.mobileBannerSub')),
  };

  return (
    <>
      <Seo title={t('services.seoTitle')} description={t('services.seoDescription')} path="/services" />
      <section className="container-content py-10 sm:py-16">
        <SectionHeading title={c.heading} subtitle={c.sub} />

        {/* Two clear booking workflows */}
        <Reveal className="mt-8">
          <h2 className="mb-4 font-display text-lg uppercase tracking-wide text-brand-white">
            {c.howHeading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card flex flex-col">
              <span className="icon-chip">
                <PhoneIcon />
              </span>
              <h3 className="mt-3 text-lg text-brand-white">{t('services.how.callTitle')}</h3>
              <p className="mt-1 flex-1 text-sm text-brand-chrome">{t('services.how.callBody')}</p>
              <div className="mt-4">
                <CallButton />
              </div>
            </div>
            <div className="card flex flex-col">
              <span className="icon-chip">
                <TruckIcon />
              </span>
              <h3 className="mt-3 text-lg text-brand-white">{t('services.how.onlineTitle')}</h3>
              <p className="mt-1 flex-1 text-sm text-brand-chrome">{t('services.how.onlineBody')}</p>
              <div className="mt-4">
                <Link to="/book" className="btn-primary">
                  {t('common.bookNow')}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* On-site / mobile — prominent, routes to the booking flow */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-2xl border border-brand-red/40 bg-brand-red/10 p-6 sm:p-8">
            <div className="bg-tread pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl text-brand-white sm:text-3xl">{c.mobileBanner}</h2>
                <p className="mt-2 max-w-2xl text-brand-chrome">{c.mobileBannerSub}</p>
              </div>
              <Link to="/book" className="btn-primary shrink-0">
                {t('common.bookNow')}
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {mobile.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        {/* In-shop + consultation — book online */}
        <div className="mt-12 space-y-12">
          <div>
            <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-brand-chrome sm:text-2xl">
              {t('services.category.in_shop')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {inShop.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-brand-chrome sm:text-2xl">
              {t('services.category.consultation')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {consultation.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
