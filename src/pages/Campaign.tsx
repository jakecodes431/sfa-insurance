/**
 * Campaign — the public landing for a carrier campaign link (/c/:slug). Logs the click for
 * attribution, and shows the carrier enrollment window right in the page (staying on our
 * /c/:slug URL). For the demo the window holds a mock carrier form; the real carrier agent
 * link (campaign.agent_url) is embedded here once provided. A completed enrollment logs a
 * capture for attribution.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { CheckIcon } from '@/components/ui/Icons';
import { getCampaignBySlug, logCampaignEvent } from '@/lib/data';
import { MockCarrierForm } from '@/components/campaign/MockCarrierForm';
import { enrollProducts } from '@/config/carriers.config';
import type { Campaign as CampaignT } from '@/types/campaigns';

export default function Campaign() {
  const { slug = '' } = useParams();
  const [campaign, setCampaign] = useState<CampaignT | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void getCampaignBySlug(slug).then((c) => {
      if (!active) return;
      setCampaign(c);
      if (c) void logCampaignEvent(c.id, 'click');
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const product = useMemo(
    () => (campaign ? enrollProducts[campaign.product_line] : undefined),
    [campaign],
  );

  if (campaign === undefined) {
    return <section className="container-content py-24 text-center text-brand-chrome">Loading…</section>;
  }
  if (campaign === null) return <Navigate to="/" replace />;

  return (
    <section className="container-content py-14 sm:py-20">
      <Seo
        title={`${campaign.carrier} ${product?.eyebrow ?? ''} — SFA Insurance Group`}
        path={`/c/${campaign.slug}`}
      />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
        {/* Pitch */}
        <div className="lg:pt-4">
          <span className="eyebrow">{product?.eyebrow ?? campaign.product_line}</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-white sm:text-4xl">
            {product?.headline ?? `Enroll with ${campaign.carrier}`}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-chrome sm:text-lg">
            {product?.sub ?? 'See your plan options and enroll in minutes.'}
          </p>
          {product && (
            <ul className="mt-6 space-y-3">
              {product.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-brand-white">
                  <CheckIcon className="mt-0.5 shrink-0 text-lg text-brand-red" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Embedded carrier window — the real carrier form goes here once the agent link is set. */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-steel pb-2">
            <p className="text-sm text-brand-chrome">
              Enroll with <span className="font-semibold text-brand-white">{campaign.carrier}</span>
            </p>
            <span className="text-xs text-brand-chrome/70">Secured by {campaign.carrier}</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-steel shadow-card">
            <MockCarrierForm
              carrier={campaign.carrier}
              product={product}
              onComplete={() => void logCampaignEvent(campaign.id, 'capture')}
            />
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-brand-chrome/70">
        SFA Insurance Group is an independent, licensed agency. Enrollment and payment are completed
        on the carrier's website. We are not connected with or endorsed by any government program.
      </p>
    </section>
  );
}
