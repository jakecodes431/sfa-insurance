import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const Enroll = lazy(() => import('@/pages/Enroll'));
const Campaign = lazy(() => import('@/pages/Campaign'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const Admin = lazy(() => import('@/pages/Admin'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function App() {
  return (
    <HelmetProvider>
      <TenantProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="enroll/:product" element={<Enroll />} />
                <Route path="c/:slug" element={<Campaign />} />
                <Route path="terms" element={<LegalPage kind="terms" />} />
                <Route path="privacy" element={<LegalPage kind="privacy" />} />
                {/* Orphaned starter-template routes (services/about/book/pay/promotions)
                    carried automotive/bilingual bleed and have no place in this one-pager.
                    Redirect any stray link or bookmark to the landing page. */}
                <Route path="services" element={<Navigate to="/" replace />} />
                <Route path="services/:slug" element={<Navigate to="/" replace />} />
                <Route path="about" element={<Navigate to="/" replace />} />
                <Route path="book" element={<Navigate to="/" replace />} />
                <Route path="pay" element={<Navigate to="/" replace />} />
                <Route path="promotions" element={<Navigate to="/" replace />} />
                <Route path="promotions/:slug" element={<Navigate to="/" replace />} />
                {/* SFA has no customer accounts — these customer-auth routes are orphaned.
                    /dashboard → admin (gated), /signup → the staff sign-in. */}
                <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TenantProvider>
    </HelmetProvider>
  );
}
