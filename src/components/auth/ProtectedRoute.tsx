import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types/database.types';

/**
 * Route guard. `requireRole="admin"` additionally requires the admin role.
 * NOTE: this is a UI convenience only — the real access boundary is RLS on the
 * server. A non-admin who bypasses this guard still cannot read/write admin data.
 */
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: UserRole;
}) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading) {
    return <div className="container-content py-24 text-center text-brand-chrome">{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Not an admin: send back to the staff sign-in (no customer dashboard exists, so
  // redirecting elsewhere would loop into a blank page).
  if (requireRole === 'admin' && role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
