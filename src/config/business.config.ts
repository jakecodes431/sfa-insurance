/**
 * business.config.ts — single source of truth for all business facts.
 * No business value (name, address, phone, hours, links) may be hardcoded in components.
 *
 * SFA Insurance Group. Public values are taken from https://sfainsure.com. Values not
 * published there (street address, geo, social links) are PLACEHOLDERS marked below and
 * collected during wire-up (see context/WIRE-UP-CHECKLIST.md).
 */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  /** 24h "HH:MM" open time, or null when closed. */
  open: string | null;
  /** 24h "HH:MM" close time, or null when closed. */
  close: string | null;
}

export interface ServiceAreaTown {
  /** URL slug used for service-area display. */
  slug: string;
  name: string;
}

export const businessConfig = {
  name: 'SFA Insurance Group',
  legalName: 'SFA Insurance Group',
  established: 2020, // TODO-confirm with client

  // Contact — phone from sfainsure.com; email is a PLACEHOLDER until confirmed.
  phone: '(833) 791-1800',
  phoneE164: '+18337911800', // for tel: links
  email: 'info@sfainsure.com', // PLACEHOLDER — confirm real inbox

  // Address — PLACEHOLDER (not published on the public site). Confirm at wire-up.
  address: {
    street: '', // TODO-confirm
    city: '',
    state: '',
    postalCode: '',
    full: 'Serving clients nationwide by phone', // safe public-facing default
  },

  // Geo — PLACEHOLDER. Confirm or drop the map for a phone-first agency.
  coordinates: {
    lat: 0,
    lng: 0,
  },

  // Links — existingSite is real; socials are PLACEHOLDERS.
  links: {
    existingSite: 'https://sfainsure.com/',
    googleMaps: 'https://www.google.com/maps',
    googleMapsEmbed: '',
    facebook: 'https://www.facebook.com/', // PLACEHOLDER
    instagram: 'https://www.instagram.com/', // PLACEHOLDER
    whatsapp: '', // PLACEHOLDER
    directions: '',
  },

  // Brand logo assets (in /public/brand). Reference via this config, never hardcoded.
  // Real SFA shield mark (transparent PNG, single square asset used everywhere).
  logos: {
    primaryBanner: '/brand/logo-sfa.png',
    badgeSquare: '/brand/logo-sfa.png',
  },

  /**
   * Hours of operation, from sfainsure.com: Mon–Fri 9 AM–5 PM EST, weekends closed.
   * Owner must confirm before launch.
   */
  hoursConfirmed: false, // TODO-confirm: flip to true once owner signs off
  hours: {
    mon: { open: '09:00', close: '17:00' },
    tue: { open: '09:00', close: '17:00' },
    wed: { open: '09:00', close: '17:00' },
    thu: { open: '09:00', close: '17:00' },
    fri: { open: '09:00', close: '17:00' },
    sat: { open: null, close: null }, // closed
    sun: { open: null, close: null }, // closed
  } as Record<DayKey, DayHours>,

  // Ordered for display
  dayOrder: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as DayKey[],

  // Phone-first agency: "service area" reads as the populations served, not towns.
  serviceArea: [
    { slug: 'medicare', name: 'Medicare beneficiaries' },
    { slug: 'under-65', name: 'Individuals & families under 65' },
  ] as ServiceAreaTown[],

  rating: {
    value: 4.9, // shown on sfainsure.com
    count: 0, // PLACEHOLDER — live count via reviews
  },

  /**
   * Scheduling — self-hosted Cal.com (cal.diy) at calendar.serviceflowpro.co. Booking is a
   * MANUAL per-client event type on that instance (the fork can't auto-provision). Paste the
   * SFA booking link into `calUrl` once the event type exists; until then the schedule dialog
   * shows a call-to-book fallback. Replaces the client's current Calendly embed.
   */
  scheduling: {
    provider: 'cal',
    // e.g. 'https://calendar.serviceflowpro.co/sfa-insurance/medicare-consult'
    calUrl: '',
    hoursLabel: 'Mon-Fri, 9 AM to 5 PM EST',
  },
} as const;

export type BusinessConfig = typeof businessConfig;
