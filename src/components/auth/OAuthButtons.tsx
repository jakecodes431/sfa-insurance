/**
 * OAuthButtons — social sign-in row shared by Login and Signup.
 *
 * Renders one button per ENABLED_OAUTH_PROVIDERS (config-gated; empty = nothing renders,
 * so the live site never shows a provider that isn't wired in Supabase yet). In MOCK_MODE
 * the buttons do a demo customer sign-in; in live mode signInWithOAuth redirects to the
 * provider and back to /dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { MOCK_MODE } from '@/config/env';
import {
  ENABLED_OAUTH_PROVIDERS,
  OAUTH_PROVIDER_LABEL,
  type OAuthProvider,
} from '@/config/auth.config';

const PROVIDER_ICON: Record<OAuthProvider, JSX.Element> = {
  google: (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  ),
  azure: (
    <svg viewBox="0 0 24 24" width="1.05em" height="1.05em" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10.4v10.4H1z" />
      <path fill="#7FBA00" d="M12.6 1H23v10.4H12.6z" />
      <path fill="#00A4EF" d="M1 12.6h10.4V23H1z" />
      <path fill="#FFB900" d="M12.6 12.6H23V23H12.6z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.35 1.92-3.48 2-3.54-1.09-1.6-2.79-1.82-3.39-1.84-1.44-.15-2.81.85-3.54.85-.73 0-1.85-.83-3.05-.81-1.57.02-3.02.91-3.83 2.32-1.63 2.83-.42 7.01 1.17 9.31.78 1.12 1.71 2.38 2.93 2.34 1.18-.05 1.62-.76 3.04-.76 1.42 0 1.82.76 3.06.73 1.26-.02 2.06-1.14 2.83-2.27.89-1.3 1.26-2.56 1.28-2.63-.03-.01-2.45-.94-2.48-3.72ZM14.05 5.5c.65-.79 1.09-1.88.97-2.97-.94.04-2.08.63-2.75 1.41-.6.7-1.13 1.81-.99 2.88 1.05.08 2.12-.53 2.77-1.32Z" />
    </svg>
  ),
};

export function OAuthButtons() {
  const { t } = useTranslation();
  const { signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);

  if (ENABLED_OAUTH_PROVIDERS.length === 0) return null;

  async function handle(provider: OAuthProvider) {
    setBusy(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setBusy(null);
      return;
    }
    // Live mode redirects the browser away; only the mock path returns here authenticated.
    if (MOCK_MODE) navigate('/dashboard', { replace: true });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-brand-steel" />
        <span className="text-xs uppercase tracking-wide text-brand-chrome">{t('auth.orDivider')}</span>
        <span className="h-px flex-1 bg-brand-steel" />
      </div>
      <div className="mt-4 space-y-3">
        {ENABLED_OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => handle(provider)}
            disabled={busy !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-brand-steel bg-brand-white px-4 py-3 text-sm font-semibold text-brand-black transition hover:bg-brand-chrome/90 disabled:opacity-60"
          >
            {PROVIDER_ICON[provider]}
            {t(OAUTH_PROVIDER_LABEL[provider])}
          </button>
        ))}
      </div>
    </div>
  );
}
