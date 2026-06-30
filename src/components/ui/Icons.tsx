/**
 * Icons.tsx — crisp inline SVG icon set (no emoji anywhere in the UI).
 * All icons inherit `currentColor` and a default 1.6 stroke, sized via className.
 * `iconForService` maps a service slug/category to the right glyph so cards,
 * the Why strip, and the dispatch flow all share one visual language.
 */
import type { SVGProps } from 'react';
import type { Service, ServiceCategory } from '@/config/services.config';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: '1em',
  height: '1em',
  ...props,
});

/** A tire / wheel — the brand's core glyph. */
export const TireIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 3v3.6M12 17.4V21M3 12h3.6M17.4 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5" />
  </svg>
);

/** Wrench — repair/in-shop work. */
export const WrenchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L3 17.5 6.5 21l6.3-6.3a4 4 0 0 0 4.9-5.4l-2.3 2.3-2.2-.5-.5-2.2 2-2.6Z" />
  </svg>
);

/** Tow truck / mobile van — roadside dispatch. */
export const TruckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 7h9v8H2zM11 10h5l3 3v2h-8z" />
    <circle cx="6" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
    <path d="M2 15h2M11 15h3.5M19 15h3" />
  </svg>
);

/** Phone handset — click-to-call. */
export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 3h3l1.5 5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />
  </svg>
);

/** Map pin — location/service area. */
export const PinIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

/** Shield-check — trust/safety, free inspection. */
export const ShieldIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3Z" />
    <path d="M9 11.5l2 2 4-4" />
  </svg>
);

/** Lightning bolt — fast / responsive. */
export const BoltIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

/** Speech bubbles — bilingual service. */
export const ChatIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    <path d="M19 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v3l-3-3" />
  </svg>
);

/** Price tag — value / used tires. */
export const TagIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);

/** Handshake — personal/named service. */
export const HandshakeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m11 6 2.5-1.5L21 9v6l-3 2-3-3" />
    <path d="M3 9v6l3 2 4-3 2 1.5a1.6 1.6 0 0 0 2-2.4L8 6 3 9Z" />
  </svg>
);

/** Sparkle — detailing / clean. */
export const SparkleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
);

/** Fuel pump — fuel delivery. */
export const FuelIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M3 21h11" />
    <path d="M13 8h3l2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-7l-3-4" />
    <path d="M6 8h5" />
  </svg>
);

/** Battery — jumpstart. */
export const BatteryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="8" width="18" height="10" rx="2" />
    <path d="M7 5v2M17 5v2M9 13h2M10 12v2M14 13h2" />
  </svg>
);

/** Star — ratings (filled when `filled`). */
export const StarIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg
    {...base({ ...props, fill: filled ? 'currentColor' : 'none', strokeWidth: filled ? 0 : 1.4 })}
  >
    <path d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.3l1-5.8-4.3-4.1 5.9-.9L12 3.2Z" />
  </svg>
);

/** Arrow-right — CTA affordance. */
export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Chevron-down — dropdown affordance. */
export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Check — selected dropdown option. */
export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

/** Shopping cart. */
export const CartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 4h2l2.4 12.2a1.6 1.6 0 0 0 1.6 1.3h8.2a1.6 1.6 0 0 0 1.6-1.2L21 8H6" />
    <circle cx="9.5" cy="20.5" r="1.4" />
    <circle cx="17.5" cy="20.5" r="1.4" />
  </svg>
);

/** Plus — add to cart. */
export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** X — close / remove. */
export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** Trash — remove cart line. */
export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13a1.6 1.6 0 0 0 1.6 1.5h6.8A1.6 1.6 0 0 0 17 20L18 7M10 11v6M14 11v6" />
  </svg>
);

/** Navigation arrow — "Directions" (opens maps). */
export const NavigationIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 11l18-8-8 18-2-8-8-2Z" />
  </svg>
);

/** Share nodes — Web Share. */
export const ShareIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="18" cy="5.5" r="2.4" />
    <circle cx="18" cy="18.5" r="2.4" />
    <path d="M8.1 11l7.8-4M8.1 13l7.8 4" />
  </svg>
);

/** Single message bubble — Text / WhatsApp. */
export const MessageIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 5h16a1.6 1.6 0 0 1 1.6 1.6v8.8A1.6 1.6 0 0 1 20 17H9l-5 4v-4H4a1.6 1.6 0 0 1-1.6-1.6V6.6A1.6 1.6 0 0 1 4 5Z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
);

/** Envelope — email channel. */
export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </svg>
);

/** Calendar — scheduling / book a time. */
export const CalendarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 3v4M16 3v4" />
  </svg>
);

/** Person — account / login. */
export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

/** Map service slug/category → icon component. PLACEHOLDER slugs (generic base). */
const SLUG_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  'standard-service': WrenchIcon,
  'premium-service': SparkleIcon,
  'maintenance-checkup': ShieldIcon,
  'free-consultation': ChatIcon,
  'on-site-visit': TruckIcon,
  'emergency-callout': TruckIcon,
};

const CATEGORY_ICONS: Record<ServiceCategory, (props: IconProps) => JSX.Element> = {
  in_shop: WrenchIcon,
  mobile: TruckIcon,
  consultation: ChatIcon,
};

// eslint-disable-next-line react-refresh/only-export-components
export function iconForService(service: Service): (props: IconProps) => JSX.Element {
  return SLUG_ICONS[service.slug] ?? CATEGORY_ICONS[service.category];
}

// eslint-disable-next-line react-refresh/only-export-components
export function iconForCategory(category: ServiceCategory): (props: IconProps) => JSX.Element {
  return CATEGORY_ICONS[category];
}
