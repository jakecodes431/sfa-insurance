import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Seo } from '@/components/seo/Seo';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

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
    <section className="container-content max-w-md py-10 sm:py-16">
      <Seo title={`${t('auth.loginTitle')} — ${t('common.appName')}`} path="/login" />
      <h1 className="text-3xl text-brand-white">{t('auth.loginTitle')}</h1>
      <p className="mt-2 text-sm text-brand-chrome">{t('auth.optionalNote')}</p>

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

      <OAuthButtons />

      <p className="mt-6 text-sm text-brand-chrome">
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className="text-brand-red">
          {t('auth.signupCta')}
        </Link>
      </p>
    </section>
  );
}
