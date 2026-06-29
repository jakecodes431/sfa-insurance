import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/seo/Seo';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <section className="container-content flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Seo title={`${t('common.notFound')} — ${t('common.appName')}`} description={t('common.notFound')} path="/404" />
      <h1 className="text-6xl text-brand-red">404</h1>
      <p className="text-xl text-brand-chrome">{t('common.notFound')}</p>
      <Link to="/" className="btn-primary">
        {t('common.goHome')}
      </Link>
    </section>
  );
}
