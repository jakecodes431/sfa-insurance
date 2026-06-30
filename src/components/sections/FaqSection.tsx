/**
 * FaqSection — editorial accordion of common questions, in the site's light theme
 * (hairline-divided rows, navy ink, blue accent). One item open at a time; smooth
 * height reveal via the grid-rows 0fr/1fr technique (no JS measuring). Also emits
 * FAQPage structured data for SEO.
 */
import { useState } from 'react';
import { faqs } from '@/config/faq.config';
import { ChevronDownIcon } from '@/components/ui/Icons';

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section id="faq" className="container-content scroll-mt-24 py-16 sm:py-28">
      {/* FAQPage structured data (valid anywhere in the DOM; injected directly so it
          renders reliably). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div data-reveal className="max-w-2xl">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-5 text-3xl text-brand-white sm:text-5xl">
          Frequently <span className="font-normal italic">asked</span> questions
        </h2>
      </div>

      <div data-reveal className="mt-10 sm:mt-12">
        <div className="rule" />
        <ul>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-[44px] w-full items-center justify-between gap-5 py-5 text-left"
                >
                  <span className="text-base font-medium text-brand-white sm:text-lg">{f.q}</span>
                  <ChevronDownIcon
                    className={`shrink-0 text-xl text-brand-red transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl pb-6 pr-8 leading-relaxed text-brand-chrome">{f.a}</p>
                  </div>
                </div>
                <div className="rule" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
