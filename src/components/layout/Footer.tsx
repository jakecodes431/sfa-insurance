import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { useLocale } from '@/hooks/useLocale';
import { useContent } from '@/lib/content';
import { formatTime } from '@/lib/format';
import { asset } from '@/lib/asset';

export function Footer() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const tagline = useContent('footer.tagline', t('footer.tagline'));

  return (
    <footer className="border-t border-brand-steel bg-brand-charcoal">
      <div className="container-content grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <img
            src={asset(businessConfig.logos.badgeSquare)}
            alt={t('header.logoAlt')}
            className="h-28 w-28 sm:h-32 sm:w-32"
            width={1254}
            height={1254}
          />
          <p className="mt-3 font-display text-lg text-brand-red">
            {tagline}
          </p>
          <p className="mt-1 text-sm text-brand-chrome">{businessConfig.legalName}</p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-base text-brand-white">{t('footer.contact')}</h3>
          <address className="mt-3 space-y-1 not-italic text-sm text-brand-chrome">
            <p>{businessConfig.address.full}</p>
            <p>
              <a
                href={`tel:${businessConfig.phoneE164}`}
                className="text-brand-white hover:text-brand-red"
              >
                {businessConfig.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${businessConfig.email}`}
                className="hover:text-brand-white"
              >
                {businessConfig.email}
              </a>
            </p>
          </address>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-base text-brand-white">{t('footer.hours')}</h3>
          <ul className="mt-3 space-y-1 text-sm text-brand-chrome">
            {businessConfig.dayOrder.map((day) => {
              const h = businessConfig.hours[day];
              return (
                <li key={day} className="flex justify-between gap-4">
                  <span>{t(`days.${day}`)}</span>
                  <span>
                    {h.open && h.close
                      ? `${formatTime(h.open, locale)} – ${formatTime(h.close, locale)}`
                      : t('footer.closed')}
                  </span>
                </li>
              );
            })}
          </ul>
          {!businessConfig.hoursConfirmed && (
            <p className="mt-2 text-xs text-brand-chrome/70">{t('footer.hoursUnconfirmed')}</p>
          )}
        </div>

        {/* Social + payments */}
        <div>
          <h3 className="text-base text-brand-white">{t('footer.follow')}</h3>
          <div className="mt-3 flex gap-3">
            <a
              href={businessConfig.links.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-brand-chrome hover:text-brand-white"
            >
              Facebook
            </a>
            <a
              href={businessConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-brand-chrome hover:text-brand-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-steel">
        <div className="container-content flex flex-col items-center justify-between gap-2 py-4 text-xs text-brand-chrome sm:flex-row">
          <p>
            © {businessConfig.established}–{new Date().getFullYear()} {businessConfig.name}.{' '}
            {t('footer.rightsReserved')}
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-brand-white">
              {t('footer.terms')}
            </Link>
            <Link to="/privacy" className="hover:text-brand-white">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
