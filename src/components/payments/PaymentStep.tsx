import { useEffect, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { getStripe } from '@/lib/stripe';
import { createPaymentIntent, finalizeSimulatedPayment } from '@/lib/payments';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney } from '@/lib/format';

export interface PaymentStepProps {
  amountCents: number;
  bookingId?: string;
  promoRegistrationId?: string;
  kind: 'deposit' | 'event';
  onSuccess: (receiptUrl: string) => void;
}

/**
 * Bilingual Stripe payment step. Used by the mobile-dispatch deposit (Phase 4) and paid
 * event registration (Phase 6). In placeholder mode it runs a clearly-labeled SIMULATED
 * path (no Stripe call); with real keys it uses the Stripe Payment Element.
 */
export function PaymentStep(props: PaymentStepProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void createPaymentIntent({
      booking_id: props.bookingId,
      promo_registration_id: props.promoRegistrationId,
      amount_cents: props.amountCents,
      locale,
    })
      .then((res) => {
        if (!active) return;
        setClientSecret(res.clientSecret);
        setSimulated(res.simulated);
      })
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // amountCents/ids are stable for the lifetime of this step
  }, []);

  const stripePromise = useMemo(() => getStripe(), []);

  if (loading) return <p className="card text-brand-chrome">{t('common.loading')}</p>;
  if (error) return <p className="card text-brand-red">{error}</p>;
  if (!clientSecret) return <p className="card text-brand-red">{t('common.error')}</p>;

  // ---- Simulated path (placeholder mode) ----
  if (simulated) {
    return (
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-brand-chrome">{t('payment.amount')}</span>
          <span className="text-xl text-brand-white">{formatMoney(props.amountCents, locale)}</span>
        </div>
        <p className="rounded-md border border-dashed border-brand-steel p-3 text-xs text-brand-chrome">
          {t('payment.simulatedNotice')}
        </p>
        <SimulatedPayButton {...props} clientSecret={clientSecret} />
      </div>
    );
  }

  // ---- Real Stripe path ----
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-brand-chrome">{t('payment.amount')}</span>
        <span className="text-xl text-brand-white">{formatMoney(props.amountCents, locale)}</span>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
        <RealPaymentForm amountCents={props.amountCents} onSuccess={props.onSuccess} />
      </Elements>
    </div>
  );
}

function SimulatedPayButton(props: PaymentStepProps & { clientSecret: string }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    const { receiptUrl } = await finalizeSimulatedPayment({
      clientSecret: props.clientSecret,
      amountCents: props.amountCents,
      locale,
      bookingId: props.bookingId,
      promoRegistrationId: props.promoRegistrationId,
      kind: props.kind,
    });
    props.onSuccess(receiptUrl);
  }

  return (
    <button type="button" className="btn-primary w-full" onClick={pay} disabled={busy}>
      {busy ? t('payment.processing') : t('payment.payNow', { amount: formatMoney(props.amountCents, locale) })}
    </button>
  );
}

function RealPaymentForm({
  amountCents,
  onSuccess,
}: {
  amountCents: number;
  onSuccess: (receiptUrl: string) => void;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    setBusy(false);
    if (err) {
      setError(err.message ?? t('payment.failureBody'));
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // DB reconciliation happens via the Stripe webhook; show success here.
      onSuccess(`https://pay.stripe.com/receipts/${paymentIntent.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy || !stripe}>
        {busy ? t('payment.processing') : t('payment.payNow', { amount: formatMoney(amountCents, locale) })}
      </button>
    </form>
  );
}
