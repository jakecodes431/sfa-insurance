import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Service } from '@/config/services.config';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney } from '@/lib/format';
import { iconForService, ArrowRightIcon } from './Icons';

export function ServiceCard({ service }: { service: Service }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const ls = useLocalizedService();
  const Icon = iconForService(service);

  const priceLabel =
    service.basePriceCents === 0
      ? t('common.free')
      : service.basePriceCents === null
        ? t('common.quoteOnCall')
        : `${t('common.from')} ${formatMoney(service.basePriceCents, locale)}`;

  return (
    <Link to={`/services/${service.slug}`} className="card-interactive group flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <span className="icon-chip transition-colors group-hover:bg-brand-red group-hover:text-brand-white">
          <Icon />
        </span>
        {service.depositCents > 0 && (
          <span className="rounded-full border border-brand-red/40 bg-brand-red/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
            {t('common.depositRequired')}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl text-brand-white transition-colors group-hover:text-brand-red">
        {ls.name(service)}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-chrome">
        {ls.description(service)}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-brand-steel/60 pt-4">
        <span className="text-sm font-semibold text-brand-chrome">{priceLabel}</span>
        <span className="inline-flex items-center gap-1 font-display text-sm uppercase tracking-wide text-brand-red">
          {t('common.learnMore')}
          <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
