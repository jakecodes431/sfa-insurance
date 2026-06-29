import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/seo/Seo';
import {
  privacyPolicy,
  termsOfService,
  LEGAL_EFFECTIVE_DATE,
  type LegalBlock,
  type LegalDoc,
} from '@/config/legal.config';

/** Renders one structured block (paragraph, sub-heading, or list). */
function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'h':
      return (
        <h3 className="mt-6 font-display text-base uppercase tracking-wide text-brand-white">
          {block.text}
        </h3>
      );
    case 'ul':
      return (
        <ul className="mt-3 space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-brand-chrome">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mt-3 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-brand-chrome">
              <span className="font-display text-sm font-semibold text-brand-red">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'p':
    default:
      // whitespace-pre-line preserves the line breaks in mailing addresses.
      return <p className="mt-3 whitespace-pre-line leading-relaxed text-brand-chrome">{block.text}</p>;
  }
}

/** Long-form legal document template — shared by Terms & Privacy. */
export default function LegalPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const { t } = useTranslation();
  const title = kind === 'terms' ? t('legal.termsTitle') : t('legal.privacyTitle');
  const path = kind === 'terms' ? '/terms' : '/privacy';
  const doc: LegalDoc = kind === 'terms' ? termsOfService : privacyPolicy;

  return (
    <>
      <Seo title={`${title} — ${t('common.appName')}`} path={path} />
      <section className="container-content max-w-3xl py-10 sm:py-16">
        <header className="border-b border-brand-steel pb-6">
          <p className="eyebrow">{t('common.appName')}</p>
          <h1 className="mt-3 text-3xl text-brand-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-brand-chrome">
            {t('legal.lastUpdated')}: {LEGAL_EFFECTIVE_DATE}
          </p>
        </header>

        {doc.intro && (
          <div className="mt-8 space-y-1">
            {doc.intro.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        )}

        <div className="mt-8 space-y-10">
          {doc.sections.map((section) => (
            <div key={section.title} className="scroll-mt-24">
              <h2 className="font-display text-xl uppercase tracking-wide text-brand-white sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-2">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
