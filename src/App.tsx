import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const About = lazy(() => import('@/pages/About'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const Book = lazy(() => import('@/pages/Book'));
const Pay = lazy(() => import('@/pages/Pay'));
const Promotions = lazy(() => import('@/pages/Promotions'));
const PromotionDetail = lazy(() => import('@/pages/PromotionDetail'));
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
                <Route path="services" element={<Services />} />
                <Route path="services/:slug" element={<ServiceDetail />} />
                <Route path="about" element={<About />} />
                <Route path="terms" element={<LegalPage kind="terms" />} />
                <Route path="privacy" element={<LegalPage kind="privacy" />} />
                <Route path="book" element={<Book />} />
                <Route path="pay" element={<Pay />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="promotions/:slug" element={<PromotionDetail />} />
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
