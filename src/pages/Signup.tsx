import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Seo } from '@/components/seo/Seo';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { MOCK_MODE } from '@/config/env';

export default function Signup() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signUp(email, password, fullName);
    setBusy(false);
    if (err) setError(err);
    else if (MOCK_MODE) navigate('/dashboard', { replace: true });
    else setDone(true);
  }

  return (
    <section className="container-content max-w-md py-10 sm:py-16">
      <Seo title={`${t('auth.signupTitle')} — ${t('common.appName')}`} path="/signup" />
      <h1 className="text-3xl text-brand-white">{t('auth.signupTitle')}</h1>
      <p className="mt-2 text-sm text-brand-chrome">{t('auth.optionalNote')}</p>

      {done ? (
        <p className="mt-6 rounded-lg border border-brand-steel bg-brand-charcoal p-4 text-brand-white">
          {t('auth.signupSuccess')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-brand-chrome">{t('auth.fullName')}</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              autoComplete="name"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {t('auth.signupCta')}
          </button>
        </form>
      )}

      {!done && <OAuthButtons />}

      <p className="mt-6 text-sm text-brand-chrome">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-brand-red">
          {t('auth.loginCta')}
        </Link>
      </p>
    </section>
  );
}
