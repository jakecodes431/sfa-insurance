import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';

/** Shared success/confirmation screen for booking + dispatch + registration flows. */
export function Confirmation({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="card border-brand-red/40 text-center">
      <div className="text-5xl" aria-hidden>
        ✅
      </div>
      <h2 className="mt-4 text-2xl text-brand-white">{heading}</h2>
      <p className="mt-2 text-brand-chrome">{body}</p>
      {children}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={`tel:${businessConfig.phoneE164}`} className="btn-secondary">
          {businessConfig.phone}
        </a>
        <Link to="/" className="btn-primary">
          {t('common.goHome')}
        </Link>
      </div>
    </div>
  );
}
