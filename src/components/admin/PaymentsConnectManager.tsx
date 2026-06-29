import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connectStatus, connectRefresh, startConnectOnboarding, type ConnectStatus } from '@/lib/sfp';
import { MOCK_MODE } from '@/config/env';
import { cn } from '@/lib/cn';
import { CheckIcon } from '@/components/ui/Icons';

export function PaymentsConnectManager() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (MOCK_MODE) {
      setLoading(false);
      return;
    }
    // If we just came back from Stripe onboarding, sync live status; otherwise read it.
    const params = new URLSearchParams(window.location.search);
    const returning = params.get('connect') === 'done' || params.get('connect') === 'refresh';
    const load = returning ? connectRefresh : connectStatus;
    load()
      .then(setStatus)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load status'))
      .finally(() => setLoading(false));
  }, []);

  async function connect() {
    setWorking(true);
    setErr(null);
    try {
      const url = await startConnectOnboarding(`${window.location.origin}/admin`);
      window.location.href = url; // hand off to Stripe-hosted onboarding
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not start onboarding');
      setWorking(false);
    }
  }

  if (MOCK_MODE) {
    return (
      <div className="card max-w-xl">
        <h3 className="text-lg text-brand-white">{t('admin.payments.heading')}</h3>
        <p className="mt-2 text-sm text-brand-chrome">{t('admin.payments.mockNote')}</p>
      </div>
    );
  }
  if (loading) return <p className="text-brand-chrome">{t('admin.payments.loading')}</p>;

  const active = status?.connected;
  const pending = status?.has_account && !status?.connected;

  return (
    <div className="card max-w-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg text-brand-white">{t('admin.payments.heading')}</h3>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            active ? 'bg-green-500/15 text-green-400' : pending ? 'bg-amber-500/15 text-amber-400' : 'bg-brand-steel/30 text-brand-chrome',
          )}
        >
          {active ? t('admin.payments.statusActive') : pending ? t('admin.payments.statusPending') : t('admin.payments.statusNone')}
        </span>
      </div>

      <p className="text-sm text-brand-chrome">
        {active ? t('admin.payments.activeBody') : t('admin.payments.connectBody')}
      </p>

      {active ? (
        <ul className="space-y-1 text-sm text-brand-chrome">
          <li className="flex items-center gap-2">
            <CheckIcon className="text-sm text-green-400" /> {t('admin.payments.chargesEnabled')}
          </li>
          <li className="flex items-center gap-2">
            {status?.payouts_enabled ? <CheckIcon className="text-sm text-green-400" /> : <span className="text-brand-chrome">…</span>}
            {t('admin.payments.payoutsEnabled')}
          </li>
        </ul>
      ) : (
        <button className="btn-primary" onClick={connect} disabled={working}>
          {working
            ? t('admin.payments.redirecting')
            : pending
              ? t('admin.payments.finish')
              : t('admin.payments.connect')}
        </button>
      )}

      {err && <p className="text-sm text-brand-red">{err}</p>}
    </div>
  );
}
