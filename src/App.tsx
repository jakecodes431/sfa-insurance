import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
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
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TenantProvider>
    </HelmetProvider>
  );
}
