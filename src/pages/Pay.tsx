import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PaymentStep } from '@/components/payments/PaymentStep';
import { Confirmation } from '@/components/ui/Confirmation';

export interface PayState {
  bookingId?: string;
  promoRegistrationId?: string;
  amountCents: number;
  serviceSlug?: string;
  promoSlug?: string;
  kind: 'deposit' | 'event';
}

/**
 * Payment page. Receives the target (booking deposit or event registration) via router
 * state from the dispatch flow (Phase 4) or promo registration (Phase 6). Renders the
 * bilingual PaymentStep and a success screen. Idempotent — refreshing won't re-charge.
 */
export default function Pay() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as PayState | null;
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  if (!state) return <Navigate to="/" replace />;

  return (
    <section className="container-content max-w-lg py-10 sm:py-16">
      <Seo title={t('payment.seoTitle')} path="/pay" />
      <SectionHeading
        title={state.kind === 'deposit' ? t('payment.depositHeading') : t('payment.heading')}
        subtitle={state.kind === 'deposit' ? t('payment.depositSub') : undefined}
      />

      <div className="mt-8">
        {receiptUrl ? (
          <Confirmation heading={t('payment.successHeading')} body={t('payment.successBody')}>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-brand-red underline"
            >
              {t('payment.receipt')}
            </a>
          </Confirmation>
        ) : (
          <PaymentStep
            amountCents={state.amountCents}
            bookingId={state.bookingId}
            promoRegistrationId={state.promoRegistrationId}
            kind={state.kind}
            onSuccess={setReceiptUrl}
          />
        )}
      </div>
    </section>
  );
}
