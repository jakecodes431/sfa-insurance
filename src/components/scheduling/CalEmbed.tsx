import { useTranslation } from 'react-i18next';
import { env, runtimeFlags } from '@/config/env';

/**
 * Cal.com inline embed. When VITE_CALCOM_LINK is configured, embeds the Cal.com booking
 * page via iframe. In placeholder mode it renders a labeled placeholder and exposes a
 * "simulate booking success" action so the post-booking capture flow is testable.
 */
export function CalEmbed({
  metadata,
  onSimulateSuccess,
}: {
  metadata?: Record<string, string>;
  onSimulateSuccess: (calcomBookingId: string) => void;
}) {
  const { t } = useTranslation();

  if (runtimeFlags.calcomConfigured) {
    const params = new URLSearchParams(metadata).toString();
    const src = `https://cal.com/${env.calcomLink}${params ? `?${params}` : ''}`;
    return (
      <iframe
        title="Cal.com scheduler"
        src={src}
        className="h-[460px] w-full rounded-lg border border-brand-steel bg-white sm:h-[560px] md:h-[680px]"
        loading="lazy"
      />
    );
  }

  return (
    <div className="card flex flex-col items-center gap-4 text-center">
      <p className="text-brand-chrome">{t('book.schedulerPlaceholder')}</p>
      <p className="text-xs text-brand-chrome/60">
        {t('payment.simulatedNotice')}
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => onSimulateSuccess(`cal_demo_${Date.now().toString(36)}`)}
      >
        {t('common.continue')} →
      </button>
    </div>
  );
}
