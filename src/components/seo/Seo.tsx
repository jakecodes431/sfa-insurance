import { Helmet } from 'react-helmet-async';
import { useLocale } from '@/hooks/useLocale';
import { businessConfig } from '@/config/business.config';

/**
 * Per-page SEO: title, description, canonical, hreflang alternates (en/es), and OG tags.
 * The active locale drives <html lang> via useLocale; here we emit the alternates.
 */
export function Seo({
  title,
  description,
  path,
  image,
  jsonLd,
}: {
  title: string;
  description?: string;
  path: string; // current path, e.g. "/services"
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const { locale } = useLocale();
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://adntiresshoposwego.com';
  const url = `${origin}${path}`;
  const ogImage = image ?? `${origin}${businessConfig.logos.badgeSquare}`;

  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {/* hreflang alternates — same path serves both languages (client toggle). */}
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="es" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      {/* Open Graph / Twitter */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={locale === 'es' ? 'es_ES' : 'en_US'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
