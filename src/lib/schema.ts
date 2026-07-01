/**
 * schema.ts — JSON-LD structured data builders (local SEO is the whole game here).
 * Emits schema.org LocalBusiness with address, geo, hours, sameAs, aggregateRating.
 * Swap the @type for a more specific schema.org subtype per client vertical if useful.
 */
import { businessConfig } from '@/config/business.config';

const DAY_SCHEMA: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function buildBusinessJsonLd(reviews: { rating: number }[]): Record<string, unknown> {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : businessConfig.links.existingSite;

  const openingHours = businessConfig.dayOrder
    .map((day) => {
      const h = businessConfig.hours[day];
      if (!h.open || !h.close) return null;
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAY_SCHEMA[day],
        opens: h.open,
        closes: h.close,
      };
    })
    .filter(Boolean);

  const ratings = reviews.filter((r) => r.rating > 0);
  const aggregateRating =
    ratings.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: (
            ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
          ).toFixed(1),
          reviewCount: ratings.length,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessConfig.legalName,
    alternateName: businessConfig.name,
    image: `${origin}${businessConfig.logos.badgeSquare}`,
    url: origin,
    telephone: businessConfig.phoneE164,
    email: businessConfig.email,
    foundingDate: String(businessConfig.established),
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessConfig.address.street,
      addressLocality: businessConfig.address.city,
      addressRegion: businessConfig.address.state,
      postalCode: businessConfig.address.postalCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: businessConfig.coordinates.lat,
      longitude: businessConfig.coordinates.lng,
    },
    areaServed: businessConfig.serviceArea.map((t) => ({
      '@type': 'City',
      name: `${t.name}, ${businessConfig.address.state}`,
    })),
    openingHoursSpecification: openingHours,
    sameAs: [businessConfig.links.facebook, businessConfig.links.instagram],
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : businessConfig.links.existingSite;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${origin}${it.path}`,
    })),
  };
}
