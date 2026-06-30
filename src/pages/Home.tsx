import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { services } from '@/config/services.config';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { Seo } from '@/components/seo/Seo';
import { StarRating } from '@/components/ui/StarRating';
import { LeadCaptureForm } from '@/components/forms/LeadCaptureForm';
import { PhoneIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { getFeaturedReviews } from '@/lib/data';
import { useContent } from '@/lib/content';
import { buildBusinessJsonLd } from '@/lib/schema';
import { gsap } from '@/lib/gsap';
import { asset } from '@/lib/asset';
import type { ReviewRow } from '@/types/database.types';

const CARRIERS = [
  { name: 'Aetna', src: '/carriers/aetna.png' },
  { name: 'Ambetter', src: '/carriers/ambetter.png' },
  { name: 'Cigna', src: '/carriers/cigna.png' },
  { name: 'UnitedHealthcare', src: '/carriers/unitedhealthcare.png' },
  { name: 'Oscar', src: '/carriers/oscar.png' },
  { name: 'Healthfirst', src: '/carriers/healthfirst.png' },
];

const STEPS = [
  {
    n: '01',
    title: 'Tell us about you',
    body: 'Your doctors, prescriptions, and budget. A two-minute conversation, no obligation.',
  },
  {
    n: '02',
    title: 'We compare every plan',
    body: 'A licensed agent lays the options side by side across the top carriers, with no sales pressure.',
  },
  {
    n: '03',
    title: 'Enroll with confidence',
    body: 'Pick the plan that fits. We handle the paperwork and stay with you year after year.',
  },
];

const REASSURE = [
  { k: 'No cost to you', v: 'Our guidance is always free. We are paid by the carriers, never by you.' },
  { k: 'Top carriers', v: 'We compare plans across Humana, Aetna, UnitedHealthcare, Cigna, and more.' },
  { k: 'Licensed & local', v: 'A licensed agent who knows you by name and answers when you call.' },
  { k: 'No obligation', v: 'A plan review is free and there is never any pressure to switch or enroll.' },
];

export default function Home() {
  const { t } = useTranslation();
  const ls = useLocalizedService();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const heroHeadline = useContent('home.hero_headline', t('home.heroHeadline'));
  const heroSub = useContent('home.hero_sub', t('home.heroSub'));

  useEffect(() => {
    void getFeaturedReviews().then(setReviews);
  }, []);

  // GSAP: hero load timeline, drifting background orbs, cascading carriers, scroll reveals.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hero entrance
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
        tl.from('[data-hero-el]', { y: 26, autoAlpha: 0, stagger: 0.09 }).from(
          '[data-hero-card]',
          { y: 30, autoAlpha: 0, duration: 0.85 },
          '-=0.45',
        );

        // Generic scroll reveals
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 32,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 86%' },
          });
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const phoneHref = `tel:${businessConfig.phoneE164}`;

  return (
    <div ref={rootRef}>
      <Seo
        title={t('home.seoTitle')}
        description={t('home.seoDescription')}
        path="/"
        jsonLd={buildBusinessJsonLd(reviews)}
      />

      {/* ===== HERO — full screen: aurora bg + centered pill + statement + capture ===== */}
      <section className="relative -mt-[var(--hdr-h)] flex min-h-[100svh] flex-col overflow-hidden">
        <AuroraBackground className="!flex !h-auto !min-h-[100svh] !flex-col !items-stretch !justify-center !bg-transparent !text-brand-white">
        <div className="container-content relative z-10 flex w-full flex-col pb-8 pt-[calc(var(--hdr-h)+0.5rem)]">
          <div className="grid gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          {/* statement */}
          <div>
            {/* announcement — clean pill above the title, left-aligned */}
            <div data-hero-el className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-steel bg-brand-charcoal/70 px-4 py-1.5 text-xs text-brand-chrome shadow-sm backdrop-blur sm:whitespace-nowrap xl:text-[0.8rem]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden />
                {t('home.enrollmentBanner')}
              </span>
            </div>
            <span data-hero-el className="eyebrow">
              {t('home.heroEyebrow')}
            </span>
            <h1
              data-hero-el
              className="display-hero mt-5 text-brand-white"
              style={{ fontSize: 'clamp(2.4rem, 5.4vw, 4.5rem)' }}
            >
              {heroHeadline}
            </h1>
            <p data-hero-el className="mt-5 max-w-xl text-base leading-relaxed text-brand-chrome sm:text-lg">
              {heroSub}
            </p>

            <div data-hero-el className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={phoneHref} className="btn-primary">
                <PhoneIcon className="text-lg" />
                {t('nav.book')}
              </a>
              <a href="#quote" className="btn-secondary">
                {t('home.freeCalloutTitle')}
              </a>
            </div>

            <div data-hero-el className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2.5">
                <StarRating rating={5} size="text-base" />
                <span className="text-sm text-brand-chrome">
                  <span className="font-semibold text-brand-white">
                    {businessConfig.rating.value.toFixed(1)}
                  </span>{' '}
                  client rating
                </span>
              </div>
              <div className="h-8 w-px bg-brand-steel" aria-hidden />
              <p className="text-sm text-brand-chrome">
                <span className="font-semibold text-brand-white">No cost</span> to you, ever
              </p>
            </div>
          </div>

          {/* capture */}
          <div id="quote" data-hero-card className="scroll-mt-24 lg:pl-4">
            <div className="panel-ring !p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl text-brand-white">{t('home.formHeading')}</h2>
                <span className="hidden rounded-full bg-brand-red/[0.08] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-brand-red sm:inline">
                  Licensed
                </span>
              </div>
              <div className="mt-4">
                <LeadCaptureForm source="website-hero" />
              </div>
            </div>
          </div>
        </div>
        </div>
        </AuroraBackground>
      </section>

      {/* ===== CARRIER TRUST BAR — endless marquee, feathered edges ===== */}
      <section data-reveal className="border-y border-brand-steel bg-brand-charcoal/50">
        <div className="container-content flex flex-col gap-5 py-8 lg:flex-row lg:items-center lg:gap-10">
          <p className="shrink-0 text-center text-sm font-medium uppercase tracking-ultra text-brand-chrome lg:text-left">
            Comparing plans across
          </p>
          {/* Track is the carrier list duplicated once; the CSS animation scrolls it by
              exactly one set width for a seamless, endless loop. Edges fade via mask. */}
          <div className="marquee w-full">
            <ul className="marquee-track flex w-max items-center">
              {[...CARRIERS, ...CARRIERS].map((c, i) => (
                <li
                  key={`${c.name}-${i}`}
                  aria-hidden={i >= CARRIERS.length}
                  className="mr-12 flex h-9 w-24 shrink-0 items-center justify-center sm:mr-16 sm:w-28"
                >
                  <img
                    src={asset(c.src)}
                    alt={`${c.name} logo`}
                    loading="lazy"
                    className="max-h-7 max-w-full object-contain opacity-80 transition-opacity duration-200 hover:opacity-100 sm:max-h-8"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — airy columns (no boxed grid) ===== */}
      <section className="container-content py-20 sm:py-28">
        <div data-reveal>
          <span className="eyebrow">How it works</span>
          <h2 className="mt-5 max-w-2xl text-4xl text-brand-white sm:text-5xl">
            Real guidance, in three unhurried steps.
          </h2>
        </div>
        <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
          {STEPS.map((s) => (
            <div key={s.n} data-reveal>
              <div className="h-1 w-12 rounded-full bg-brand-red" />
              <span className="index-num mt-5 block text-5xl">{s.n}</span>
              <h3 className="mt-4 text-xl text-brand-white">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-brand-chrome">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COVERAGE — editorial index ===== */}
      <section id="coverage" className="scroll-mt-24 border-y border-brand-steel bg-brand-charcoal/50">
        <div className="container-content py-20 sm:py-28">
          <div data-reveal>
            <span className="eyebrow">{t('home.servicesHeading')}</span>
            <h2 className="mt-5 max-w-2xl text-4xl text-brand-white sm:text-5xl">
              {t('home.servicesSub')}
            </h2>
          </div>

          <div className="mt-12 rule" />
          <ul>
            {services.map((s, i) => (
              <li key={s.id} data-reveal>
                <a
                  href="#quote"
                  className="group grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-2 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
                >
                  <span className="index-num text-3xl transition-colors group-hover:text-brand-red sm:text-4xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-2xl text-brand-white transition-colors group-hover:text-brand-red sm:text-[1.65rem]">
                      {ls.name(s)}
                    </h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-brand-chrome">
                      {ls.description(s)}
                    </p>
                  </div>
                  <span className="col-span-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-red sm:col-span-1 sm:justify-self-end">
                    {t('nav.book')}
                    <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
                <div className="rule" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== REASSURANCE — statement + clean list (no boxed grid) ===== */}
      <section className="container-content py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <span className="eyebrow">{t('home.whyHeading')}</span>
            <h2 className="mt-5 text-4xl leading-tight text-brand-white sm:text-5xl">
              Our guidance is always free. You only ever pay your plan premium.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-chrome">
              We are paid by the carriers, never by you, so the only goal is finding the plan that
              actually fits, and staying with you at renewal time every year.
            </p>
            <a href="#quote" className="btn-primary mt-9">
              {t('lead.submit')}
            </a>
          </div>

          <ul className="flex flex-col">
            {REASSURE.map((item, i) => (
              <li key={item.k} data-reveal>
                {i > 0 && <div className="rule" />}
                <div className="flex gap-5 py-6">
                  <span className="index-num shrink-0 text-2xl">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg text-brand-white">{item.k}</h3>
                    <p className="mt-1.5 leading-relaxed text-brand-chrome">{item.v}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== TESTIMONIALS — pull-quotes ===== */}
      {reviews.length > 0 && (
        <section id="reviews" className="scroll-mt-24 border-t border-brand-steel bg-brand-charcoal/50">
          <div className="container-content py-20 sm:py-28">
            <div data-reveal>
              <span className="eyebrow">{t('home.reviewsHeading')}</span>
            </div>
            <div className="mt-10 grid gap-12 md:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <figure key={r.id} data-reveal className="flex h-full flex-col">
                  <span className="font-display text-6xl leading-none text-brand-red/30" aria-hidden>
                    &ldquo;
                  </span>
                  <blockquote className="-mt-4 text-lg leading-relaxed text-brand-white">
                    {r.body}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <StarRating rating={r.rating} size="text-sm" />
                    <span className="text-sm font-semibold text-brand-chrome">{r.author_name}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FINAL CTA — deep navy band ===== */}
      <section className="bg-brand-white">
        <div className="container-content grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div data-reveal>
            <h2 className="text-4xl leading-tight text-brand-black sm:text-5xl">
              {t('home.calloutHeading')}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-brand-black/70">{t('home.calloutSub')}</p>
          </div>
          <div data-reveal className="flex flex-col gap-4 lg:items-end">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-brand-black transition-colors hover:text-brand-red sm:text-4xl"
            >
              <PhoneIcon className="text-2xl text-brand-red" />
              {businessConfig.phone}
            </a>
            <a href="#quote" className="btn-primary">
              {t('lead.submit')}
            </a>
            <p className="text-sm text-brand-black/55">Mon–Fri, 9am–5pm EST</p>
          </div>
        </div>
      </section>
    </div>
  );
}
