/**
 * tenant.tsx — resolves the active tenant once at startup and exposes it to the app.
 * Brand/locale/integration config all flow from here. For ADN (the only tenant today)
 * this resolves to the ADN tenant, so nothing changes visually or functionally.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { getActiveTenant, type TenantConfig } from '@/config/tenants';

const activeTenant = getActiveTenant();

const TenantContext = createContext<TenantConfig>(activeTenant);

export function TenantProvider({ children }: { children: ReactNode }) {
  return <TenantContext.Provider value={activeTenant}>{children}</TenantContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant(): TenantConfig {
  return useContext(TenantContext);
}

/** Non-hook accessor for modules outside React (data layer, supabase client). */
// eslint-disable-next-line react-refresh/only-export-components
export function currentTenant(): TenantConfig {
  return activeTenant;
}
