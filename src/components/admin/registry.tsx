/**
 * registry.tsx — maps each AdminModule to its tab UI + label, in display order.
 *
 * The Admin shell renders this list filtered by the active tenant's
 * `enabledAdminModules` (src/config/tenants.ts). Adding a module = add its component
 * here + extend the AdminModule union in src/config/admin.config.ts. Each tenant then
 * opts in. `labelKey` reuses the existing `admin.tabs.*` i18n keys.
 *
 * This is the generic core kit. Vertical-specific tabs are added per client.
 */
import type { ComponentType } from 'react';
import type { AdminModule } from '@/config/admin.config';
import { LeadsManager } from './LeadsManager';
import { BookingsQueue } from './BookingsQueue';
import { ServicesTab } from './ServicesTab';
import { InvoicesManager } from './InvoicesManager';
import { PromosEditor } from './PromosEditor';
import { ReviewsManager } from './ReviewsManager';
import { OrdersList } from './OrdersList';
import { SiteContentManager } from './SiteContentManager';
import { PaymentsConnectManager } from './PaymentsConnectManager';

export interface AdminModuleDef {
  id: AdminModule;
  /** i18n key for the tab label. */
  labelKey: `admin.tabs.${AdminModule}`;
  Component: ComponentType;
}

/** Ordered registry — the tab bar follows this order, filtered to enabled modules. */
export const ADMIN_MODULES: AdminModuleDef[] = [
  { id: 'leads', labelKey: 'admin.tabs.leads', Component: LeadsManager },
  { id: 'bookings', labelKey: 'admin.tabs.bookings', Component: BookingsQueue },
  { id: 'services', labelKey: 'admin.tabs.services', Component: ServicesTab },
  { id: 'invoices', labelKey: 'admin.tabs.invoices', Component: InvoicesManager },
  { id: 'promotions', labelKey: 'admin.tabs.promotions', Component: PromosEditor },
  { id: 'reviews', labelKey: 'admin.tabs.reviews', Component: ReviewsManager },
  { id: 'orders', labelKey: 'admin.tabs.orders', Component: OrdersList },
  { id: 'content', labelKey: 'admin.tabs.content', Component: SiteContentManager },
  { id: 'payments', labelKey: 'admin.tabs.payments', Component: PaymentsConnectManager },
];
