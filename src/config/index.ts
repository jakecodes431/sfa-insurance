/** Central config barrel — import business/services/pricing/theme/promotions from here. */
export { businessConfig } from './business.config';
export type { DayKey, DayHours, ServiceAreaTown, BusinessConfig } from './business.config';

export {
  services,
  servicesByCategory,
  getServiceBySlug,
  bookableServices,
} from './services.config';
export type { Service, ServiceCategory } from './services.config';

export { pricingConfig } from './pricing.config';
export type { PricingConfig } from './pricing.config';

export { themeConfig } from './theme.config';
export type { ThemeColorToken } from './theme.config';

export { seedPromotions } from './promotions.config';
export type { Promotion, PromoStatus } from './promotions.config';

export { env, runtimeFlags, MOCK_MODE } from './env';
