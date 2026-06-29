/**
 * auth.tsx — Supabase Auth provider + useAuth hook.
 *
 * Auth is an OPTIONAL value-add — guest flows never require it. Admin/customer data
 * access is enforced server-side by RLS (see 007_rls.sql), not just these UI guards.
 *
 * In MOCK_MODE (placeholder credentials) we simulate sessions locally so the dashboard
 * and admin panel are demoable without a live Supabase project. Replace with the real
 * project to exercise actual Supabase Auth + RLS.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { MOCK_MODE } from '@/config/env';
import { getActiveTenant } from '@/config/tenants';
import type { OAuthProvider } from '@/config/auth.config';
import type { ProfileRow, UserRole } from '@/types/database.types';

interface AuthState {
  loading: boolean;
  session: Session | null;
  profile: ProfileRow | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  /** Social sign-in (Google/Microsoft/Apple). Redirects away in live mode. */
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** MOCK_MODE only: jump straight into a demo session of a given role. */
  mockSignInAs?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const MOCK_PROFILE_KEY = 'adn.mockProfile';

/** Decode a JWT payload (no verification — just reading our custom sfp_* claims client-side). */
function parseJwtClaims(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function makeMockProfile(role: UserRole): ProfileRow {
  return {
    id: `mock-${role}`,
    created_at: new Date().toISOString(),
    full_name: role === 'admin' ? 'Demo Admin' : 'Demo Customer',
    email: `${role}@demo.adn`,
    phone: null,
    preferred_locale: 'en',
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  // Guards the one-time organization_code backfill below (avoids re-firing on every event).
  const orgStampedRef = useRef(false);

  // OAuth logins don't go through signUp(), so they never get organization_code stamped into
  // user_metadata (which email/password signup does — see signUp). Backfill it once per session
  // so per-org email branding + staff mapping work the same for social sign-ins.
  const ensureOrgStamp = useCallback(async (sess: Session | null) => {
    if (!sess?.user || orgStampedRef.current) return;
    const meta = sess.user.user_metadata ?? {};
    if (typeof meta.organization_code === 'string' && meta.organization_code) return;
    orgStampedRef.current = true;
    await supabase.auth.updateUser({ data: { organization_code: getActiveTenant().slug } });
  }, []);

  // ----- Identity from the session (real mode) -----
  // On the SFP backend there is no `profiles` table; a user's org + role are stamped into the
  // JWT by sfp_custom_access_token_hook (claims sfp_org / sfp_role, sourced from sfp_staff).
  // We read the role straight from the token: owner/admin/manager → app "admin", any other
  // staff role → "staff", and no staff claim → "customer".
  const applySession = useCallback((sess: Session | null) => {
    setSession(sess);
    if (!sess?.user) {
      setProfile(null);
      return;
    }
    const claims = parseJwtClaims(sess.access_token);
    const sfpRole = typeof claims.sfp_role === 'string' ? claims.sfp_role : null;
    const role: UserRole = sfpRole
      ? ['owner', 'admin', 'manager'].includes(sfpRole)
        ? 'admin'
        : 'staff'
      : 'customer';
    const meta = sess.user.user_metadata ?? {};
    setProfile({
      id: sess.user.id,
      created_at: sess.user.created_at ?? new Date().toISOString(),
      full_name: typeof meta.full_name === 'string' ? meta.full_name : null,
      email: sess.user.email ?? null,
      phone: null,
      preferred_locale: 'en',
      role,
    });
  }, []);

  useEffect(() => {
    if (MOCK_MODE) {
      const raw = localStorage.getItem(MOCK_PROFILE_KEY);
      if (raw) setProfile(JSON.parse(raw) as ProfileRow);
      setLoading(false);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      applySession(data.session);
      void ensureOrgStamp(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      void ensureOrgStamp(nextSession);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession, ensureOrgStamp]);

  const value = useMemo<AuthState>(() => {
    const mockSignInAs = (role: UserRole) => {
      const p = makeMockProfile(role);
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(p));
      setProfile(p);
    };

    return {
      loading,
      session,
      profile,
      isAuthenticated: MOCK_MODE ? profile !== null : session !== null,
      role: profile?.role ?? null,
      mockSignInAs: MOCK_MODE ? mockSignInAs : undefined,

      signIn: async (email, password) => {
        if (MOCK_MODE) {
          mockSignInAs(email.includes('admin') ? 'admin' : 'customer');
          return { error: null };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },

      signUp: async (email, password, fullName) => {
        if (MOCK_MODE) {
          mockSignInAs('customer');
          return { error: null };
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          // Tag the user with their tenant so the send-auth-email hook can brand the email
          // for the right site (and so staff/admin mapping knows the org).
          options: { data: { full_name: fullName, organization_code: getActiveTenant().slug } },
        });
        return { error: error?.message ?? null };
      },

      signInWithMagicLink: async (email) => {
        if (MOCK_MODE) {
          mockSignInAs(email.includes('admin') ? 'admin' : 'customer');
          return { error: null };
        }
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error: error?.message ?? null };
      },

      signInWithOAuth: async (provider) => {
        if (MOCK_MODE) {
          mockSignInAs('customer');
          return { error: null };
        }
        // Live mode: this navigates the browser to the provider and back to redirectTo,
        // where detectSessionInUrl picks up the session (see supabase.ts).
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/dashboard` },
        });
        return { error: error?.message ?? null };
      },

      signOut: async () => {
        orgStampedRef.current = false;
        if (MOCK_MODE) {
          localStorage.removeItem(MOCK_PROFILE_KEY);
          setProfile(null);
          return;
        }
        await supabase.auth.signOut();
      },
    };
  }, [loading, session, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
