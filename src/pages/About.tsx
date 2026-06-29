import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { useContent } from '@/lib/content';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';

const VALUE_KEYS = ['trust', 'speed', 'bilingual', 'value'] as const;

export default function About() {
  const { t } = useTranslation();
  // Admin-editable page copy (falls back to bundled i18n until edited).
  const c = {
    heading: useContent('about.heading', t('about.heading')),
    body1: useContent('about.body1', t('about.body1')),
    body2: useContent('about.body2', t('about.body2')),
    teamHeading: useContent('about.team_heading', t('about.teamHeading')),
    teamBody: useContent('about.team_body', t('about.teamBody')),
    valuesHeading: useContent('about.values_heading', t('about.valuesHeading')),
  };
  return (
    <>
      <Seo title={t('about.seoTitle')} description={t('about.seoDescription')} path="/about" />
      <section className="container-content max-w-3xl py-10 sm:py-16">
        <SectionHeading title={c.heading} />
        <p className="mt-6 text-lg text-brand-chrome">{c.body1}</p>
        <p className="mt-4 text-lg text-brand-chrome">{c.body2}</p>

        <h2 className="mt-12 text-2xl text-brand-white">{c.teamHeading}</h2>
        <p className="mt-3 text-brand-chrome">{c.teamBody}</p>

        <h2 className="mt-12 text-2xl text-brand-white">{c.valuesHeading}</h2>
        <ul className="mt-4 grid gap-2.5 sm:gap-3 sm:grid-cols-2">
          {VALUE_KEYS.map((k) => (
            <li key={k} className="card break-words text-brand-white">
              {t(`about.values.${k}`)}
            </li>
          ))}
        </ul>

        <p className="mt-12 text-sm text-brand-chrome">
          {businessConfig.legalName} · {businessConfig.address.full} ·{' '}
          <a href={`tel:${businessConfig.phoneE164}`} className="text-brand-red">
            {businessConfig.phone}
          </a>
        </p>
      </section>
    </>
  );
}
