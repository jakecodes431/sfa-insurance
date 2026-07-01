/**
 * Campaign — the public landing for a carrier campaign link (/c/:slug). Logs the click for
 * attribution, captures the lead (so SFA owns the data), then opens an in-site popup that
 * either embeds the carrier's enrollment page (if it allows framing) or hands off to it.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { Modal } from '@/components/ui/Modal';
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
  const [popup, setPopup] = useState(false);

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
      setPopup(true);
    } finally {
      setBusy(false);
    }
  }

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

      {/* In-site carrier popup: embed if allowed, else hand off. */}
      <Modal open={popup} onClose={() => setPopup(false)} labelledBy="carrier-title" size={campaign.embed ? 'max-w-4xl' : 'max-w-md'}>
        <div className="px-6 pb-6 pt-8">
          <h2 id="carrier-title" className="font-display text-xl font-bold text-brand-white">
            Enroll with {campaign.carrier}
          </h2>
          {campaign.embed ? (
            <>
              <p className="mt-1 text-sm text-brand-chrome">Complete your enrollment below.</p>
              <iframe
                src={campaign.agent_url}
                title={`${campaign.carrier} enrollment`}
                className="mt-4 h-[60vh] min-h-[360px] w-full rounded-xl border border-brand-steel"
              />
              <p className="mt-3 text-center text-xs text-brand-chrome/70">
                Not loading?{' '}
                <a href={campaign.agent_url} target="_blank" rel="noreferrer noopener" className="text-brand-red underline">
                  Open {campaign.carrier} in a new tab
                </a>
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-brand-chrome">
                You are all set. Continue to {campaign.carrier} to choose your plan and enroll. A
                licensed SFA agent is here if you need help.
              </p>
              <a
                href={campaign.agent_url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary mt-5 w-full"
              >
                Open {campaign.carrier} enrollment
                <ArrowRightIcon className="text-base" />
              </a>
            </>
          )}
        </div>
      </Modal>
    </section>
  );
}
