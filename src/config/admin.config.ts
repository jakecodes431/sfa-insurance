/**
 * admin.config.ts — the set of admin modules (dashboard tabs) the platform offers.
 *
 * Each tenant enables only the modules its vertical needs via `enabledAdminModules`
 * in src/config/tenants.ts. The component registry that maps a module to its UI lives in
 * src/components/admin/registry.tsx; tab order is defined there.
 *
 * This is the generic, vertical-agnostic core kit. Vertical-specific tabs (e.g. a tire
 * shop's inventory/vehicle managers) are added per client by extending this union and
 * the registry, then opting the tenant in.
 */
export type AdminModule =
  | 'overview'
  | 'leads'
  | 'bookings'
  | 'services'
  | 'invoices'
  | 'promotions'
  | 'reviews'
  | 'orders'
  | 'content'
  | 'payments';

/** Every generic module — convenience for tenants that want the full core kit. */
export const ALL_ADMIN_MODULES: AdminModule[] = [
  'leads',
  'bookings',
  'services',
  'invoices',
  'promotions',
  'reviews',
  'orders',
  'content',
  'payments',
];

/**
 * SFA Insurance Group's lean owner dashboard: captured leads, the appointment queue,
 * and reviews. No payments/invoices/orders — SFA never charges the consumer (carriers
 * process enrollments + commission).
 */
export const SFA_ADMIN_MODULES: AdminModule[] = ['overview', 'leads', 'bookings', 'reviews'];
