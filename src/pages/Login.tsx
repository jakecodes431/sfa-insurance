import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Seo } from '@/components/seo/Seo';

/**
 * Staff sign-in. SFA has no customer accounts (the public site is lead capture + booking),
 * so /login exists only to reach the admin portal — no guest/booking copy, no social
 * logins, no public sign-up. Credentials are provisioned by an administrator (sfp_staff).
 */
export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
    else navigate(from, { replace: true });
  }

  return (
    <section className="container-content max-w-md py-16 sm:py-24">
      <Seo title={`Staff Sign In — ${t('common.appName')}`} path="/login" />
      <h1 className="text-3xl text-brand-white">Staff Sign In</h1>
      <p className="mt-2 text-sm text-brand-chrome">
        Authorized SFA staff only. Use the credentials provided by your administrator.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-brand-chrome">{t('auth.email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-brand-chrome">{t('auth.password')}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {t('auth.loginCta')}
        </button>
      </form>
    </section>
  );
}
