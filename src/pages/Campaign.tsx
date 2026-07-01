/**
 * Campaign — the public landing for a carrier campaign link (/c/:slug). Logs the click for
 * attribution, captures the lead (so SFA owns the data), then shows the carrier's enrollment
 * page in an EMBEDDED window that stays on our /c/:slug URL (embed mode). If the carrier
 * blocks framing (X-Frame-Options), the embed shows blank and the "open in a new tab" link
 * is the fallback. Campaigns with embed=off use the new-tab handoff instead.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { CheckIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { createLead, getCampaignBySlug, logCampaignEvent } from '@/lib/data';
import { enrollProducts } from '@/config/carriers.config';
import type { Campaign as CampaignT } from '@/types/campaigns';

export default function Campaign() {
  const { slug = '' } = useParams();
  const [campaign, setCampaign] = useState<CampaignT | null | undefined>(undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  async function proceed(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setBusy(true);
    try {
      if (name.trim()) {
        const lead = await createLead({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          zip: zip.trim() || null,
          product_line: campaign!.product_line as 'dental-vision' | 'life-final-expense',
          best_time: 'anytime',
          consent_contact: consent,
          source: `campaign:${campaign!.slug}`,
          status: 'new',
        });
        await logCampaignEvent(campaign!.id, 'capture', lead.id);
      }
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  }

  const firstName = name.split(' ')[0] || 'there';

  // ---- After capture: embedded carrier window (stays on our URL) ----
  if (submitted && campaign.embed) {
    return (
      <section className="container-content py-5 sm:py-6">
        <Seo title={`${campaign.carrier} — SFA Insurance Group`} path={`/c/${campaign.slug}`} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-steel pb-3">
          <p className="text-sm text-brand-chrome">
            Enrolling with <span className="font-semibold text-brand-white">{campaign.carrier}</span>
            {product ? ` · ${product.eyebrow}` : ''}
          </p>
          <a
            href={campaign.agent_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs font-medium text-brand-red underline"
          >
            Open in a new tab
          </a>
        </div>
        <iframe
          src={campaign.agent_url}
          title={`${campaign.carrier} enrollment`}
          className="mt-4 h-[76vh] min-h-[420px] w-full rounded-xl border border-brand-steel bg-white"
        />
        <p className="mt-2 text-center text-xs text-brand-chrome/70">
          If {campaign.carrier}'s page does not load here, they block embedding — use “Open in a new
          tab”.
        </p>
      </section>
    );
  }

  // ---- After capture (non-embed): new-tab handoff ----
  if (submitted) {
    return (
      <section className="container-content max-w-lg py-16 text-center sm:py-24">
        <Seo title={`${campaign.carrier} — SFA Insurance Group`} path={`/c/${campaign.slug}`} />
        <h1 className="text-2xl font-bold text-brand-white">You are all set, {firstName}.</h1>
        <p className="mt-2 text-brand-chrome">
          Continue to {campaign.carrier} to choose your plan and enroll. A licensed SFA agent is here
          if you need help.
        </p>
        <a href={campaign.agent_url} target="_blank" rel="noreferrer noopener" className="btn-primary mt-6">
          Open {campaign.carrier} enrollment
          <ArrowRightIcon className="text-base" />
        </a>
      </section>
    );
  }

  // ---- Before capture: pitch + capture form ----
  return (
    <section className="container-content py-14 sm:py-20">
      <Seo title={`${campaign.carrier} ${product?.eyebrow ?? ''} — SFA Insurance Group`} path={`/c/${campaign.slug}`} />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
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

        <div className="panel-ring !p-6">
          <h2 className="text-xl font-bold text-brand-white">Get started</h2>
          <p className="mt-1 text-sm text-brand-chrome">
            A few quick details and we will take you to {campaign.carrier} to enroll.
          </p>
          <form onSubmit={proceed} className="mt-5 space-y-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="input-field" />
              <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Zip" className="input-field" />
            </div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="input-field" />
            <label className="flex items-start gap-2 text-xs leading-relaxed text-brand-chrome">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
              I agree to be contacted by SFA Insurance Group about my coverage options.
            </label>
            <button type="submit" disabled={busy || !name.trim() || !consent} className="btn-primary w-full disabled:opacity-40">
              Continue to {campaign.carrier}
            </button>
          </form>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-brand-chrome/70">
        SFA Insurance Group is an independent, licensed agency. Enrollment and payment are completed
        on the carrier's website. We are not connected with or endorsed by any government program.
      </p>
    </section>
  );
}
